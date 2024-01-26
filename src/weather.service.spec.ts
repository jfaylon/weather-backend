import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { WeatherService } from './weather.service';
import { of, throwError } from 'rxjs';
import { AreaMetaData, WeatherData } from './interfaces/weather.interface';

describe('WeatherService', () => {
  let service: WeatherService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('queryApi', () => {
    it('should fetch weather data', async () => {
      const date = '2024-01-01';
      const dateTime = '2024-01-01T12:00:00';

      const mockWeatherData: WeatherData = {
        area_metadata: [
          {
            name: 'Test',
            label_location: {
              latitude: 1.0,
              longitude: 2.0,
            },
          },
        ],
        items: [
          {
            update_timestamp: '2024-01-01T12:00:00',
            timestamp: '2024-01-01T12:00:00',
            valid_period: {
              start: '2024-01-01T12:00:00',
              end: '2024-01-01T12:00:00',
            },
            forecasts: [
              {
                area: 'Test',
                forecast: 'Cloudy',
              },
            ],
          },
        ],
      };
      mockHttpService.get.mockReturnValueOnce(of({ data: mockWeatherData }));
      const result = await service.queryApi(date, dateTime);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.data.gov.sg/v1/environment/2-hour-weather-forecast',
        {
          params: { date, date_time: dateTime },
        },
      );
      expect(result).toEqual(mockWeatherData);
    });
    it('should throw an error', async () => {
      const date = '2024-01-01';
      const dateTime = '2024-01-01T12:00:00';
      mockHttpService.get.mockReturnValueOnce(
        throwError(() => new Error('Test Error')),
      );
      await expect(service.queryApi(date, dateTime)).rejects.toThrow(
        'Test Error',
      );
    });
  });
  describe('getAreaMetaData', () => {
    it('should fetch area metadata using queryApi', async () => {
      const mockAreaMetadata: AreaMetaData[] = [
        {
          name: 'Test',
          label_location: {
            latitude: 1.0,
            longitude: 2.0,
          },
        },
      ];
      jest
        .spyOn(service, 'queryApi')
        .mockReturnValueOnce(
          Promise.resolve({ area_metadata: mockAreaMetadata, items: [] }),
        );

      const result = await service.getAreaMetaData();

      expect(result).toEqual(mockAreaMetadata);
      expect(service.queryApi).toHaveBeenCalledWith();
    });
  });
  describe('getWeatherData', () => {
    it('should fetch weather data for a specific location', async () => {
      const dateTime = '2024-01-01T12:00:00';
      const location = 'TestLocation';

      const mockDateTimeWeatherData: WeatherData = {
        items: [
          {
            update_timestamp: '2024-01-01T10:00:00',
            timestamp: '2024-01-01T12:00:00',
            valid_period: {
              start: '2024-01-01T12:00:00',
              end: '2024-01-01T14:00:00',
            },
            forecasts: [{ area: location, forecast: 'Sunny' }],
          },
        ],
        area_metadata: [
          {
            name: 'MockArea',
            label_location: { latitude: 1.0, longitude: 2.0 },
          },
        ],
      };
      jest
        .spyOn(service, 'queryApi')
        .mockReturnValueOnce(Promise.resolve(mockDateTimeWeatherData));
      const result = await service.getWeatherData(dateTime, location);
      const expectedWeatherDetails = {
        locationDateTimeWeatherDetails: {
          area: location,
          forecast: 'Sunny',
          timestamp: mockDateTimeWeatherData.items[0].timestamp,
        },
      };

      expect(result).toEqual(expectedWeatherDetails);
      expect(service.queryApi).toHaveBeenCalledWith(undefined, dateTime);
    });
  });
});
