import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { WeatherService } from './weather.service';
import { findNearest } from 'geolib';
import { RedisService } from './redis.service';
import { BatchLocationData } from './interfaces/location.interface';

@Injectable()
export class LocationsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly weatherService: WeatherService,
    private readonly redisService: RedisService,
  ) {}

  async getLocations(dateTime?: string) {
    try {
      const trafficData = await firstValueFrom(
        this.httpService.get(
          `https://api.data.gov.sg/v1/transport/traffic-images${dateTime ? `?date_time=${dateTime}` : ''}`,
        ),
      );
      const metadata = await this.weatherService.getAreaMetaData();
      const newMetadata = metadata.map((data) => {
        return {
          latitude: data.label_location.latitude,
          longitude: data.label_location.longitude,
          name: data.name,
        };
      });
      const batchLocations: { lat: number; lon: number }[] = [];
      const newData = trafficData.data.items[0]?.cameras?.map((data) => {
        batchLocations.push({
          lat: data.location.latitude,
          lon: data.location.longitude,
        });
        const nearest = findNearest(data.location, newMetadata);
        return {
          ...data,
          nearest,
        };
      });
      const cachedLocations = await this.redisService
        .getClient()
        .get('locations');
      let batchLocationData;
      if (cachedLocations) {
        batchLocationData = JSON.parse(cachedLocations);
      } else {
        const cachedUrl = await this.batchQueryLocations(batchLocations);
        batchLocationData = await this.queryBatchApi(cachedUrl);
        await this.redisService
          .getClient()
          .set('locations', JSON.stringify(batchLocationData));
      }
      const processedData = newData?.map((data) => {
        const locationData = batchLocationData.find((location) => {
          return (
            data.location.latitude === location.query.lat &&
            data.location.longitude === location.query.lon
          );
        });
        return {
          cameraLocation:
            locationData?.formatted ||
            locationData?.name ||
            `${data.location.latitude}-${data.location.longitude} (Nearest: ${data.nearest.name})`,
          ...data,
          locationData,
        };
      });
      return {
        data: processedData?.sort((a, b) => {
          return a.cameraLocation
            .toUpperCase()
            .localeCompare(b.cameraLocation.toUpperCase());
        }),
      };
    } catch (error) {
      Logger.error(error);
      throw new Error('No Traffic Images Found');
    }
  }

  async batchQueryLocations(locationData: { lat: number; lon: number }[]) {
    const result = await firstValueFrom(
      this.httpService.post(
        `https://api.geoapify.com/v1/batch/geocode/reverse?apiKey=${process.env.GEOAPIFY_API_KEY}`,
        locationData,
      ),
    );
    return result.data.url;
  }

  async queryBatchApi(cachedUrl: string): Promise<BatchLocationData[]> {
    Logger.log('Getting location data from 3rd party API');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        repeatUntilSuccess(resolve, reject, 0);
      }, 5000);

      const repeatUntilSuccess = async (resolve, reject, attempt) => {
        const result = await firstValueFrom(this.httpService.get(cachedUrl));
        if (result.status === 200) {
          return resolve(result.data);
        } else if (result.status === 202) {
          setTimeout(() => {
            repeatUntilSuccess(resolve, reject, attempt + 1);
          }, 5000);
        } else {
          reject(result.data);
        }
      };
    });
  }
}
