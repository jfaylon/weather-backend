import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  WeatherData,
  AreaMetaData,
  Forecast,
} from './interfaces/weather.interface';

@Injectable()
export class WeatherService {
  constructor(private readonly httpService: HttpService) {}
  async queryApi(date?: string, dateTime?: string): Promise<WeatherData> {
    try {
      const data = await firstValueFrom(
        this.httpService.get(
          `https://api.data.gov.sg/v1/environment/2-hour-weather-forecast`,
          {
            params: {
              date,
              date_time: dateTime,
            },
          },
        ),
      );
      return await data.data;
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async getAreaMetaData(): Promise<AreaMetaData[]> {
    const rawData = (await this.queryApi()) as WeatherData;
    return rawData.area_metadata;
  }

  async getWeatherData(dateTime: string, location: string) {
    // const date = dateTime ? dateTime.split('T')[0] : undefined;
    // const { items: dateWeatherData } = await this.queryApi(date);

    const rawDateTimeWeatherData = await this.queryApi(undefined, dateTime);
    const dateTimeWeatherDetails = rawDateTimeWeatherData.items[0];

    const locationDateTimeWeatherDetails =
      dateTimeWeatherDetails.forecasts?.find(
        (forecast) => forecast.area === location,
      ) || ({} as Forecast);
    locationDateTimeWeatherDetails.timestamp =
      dateTimeWeatherDetails?.timestamp;

    // const mappedDateWeatherData = dateWeatherData.map((data) => {
    //   const locationWeather = data.forecasts.find(
    //     (forecast) => forecast.area === location,
    //   );
    //   locationWeather.timestamp = data.timestamp;
    //   return locationWeather;
    // });

    return {
      locationDateTimeWeatherDetails,
      //mappedDateWeatherData,
    };
  }
}
