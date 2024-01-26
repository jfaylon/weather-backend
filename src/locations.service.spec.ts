import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { HttpService } from '@nestjs/axios';
import { WeatherService } from './weather.service';
import { RedisService } from './redis.service';
import { of, throwError } from 'rxjs';

describe('LocationsService', () => {
  let service: LocationsService;

  // Mock HttpService
  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  // Mock WeatherService and RedisService
  const mockWeatherService = {
    getAreaMetaData: jest.fn(),
  };

  const mockRedisService = {
    getClient: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: WeatherService, useValue: mockWeatherService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLocations', () => {
    it('should return processed data', async () => {
      const mockTrafficData = {
        data: {
          items: [
            {
              cameras: [
                {
                  location: {
                    latitude: 1.0,
                    longitude: 2.0,
                  },
                },
              ],
            },
          ],
        },
      };
      mockHttpService.get.mockReturnValueOnce(of(mockTrafficData));
      const mockAreaMetaData = [
        {
          label_location: {
            latitude: 1.0,
            longitude: 2.0,
          },
          name: 'Location 1',
        },
      ];
      mockWeatherService.getAreaMetaData.mockResolvedValue(mockAreaMetaData);

      const mockBatchLocationData = [
        {
          query: { lat: 1.0, lon: 2.0 },
          formatted: 'Location 1, Singapore',
          name: 'Location 1',
        },
      ];
      mockHttpService.post.mockReturnValueOnce(
        of({ data: { url: 'https://test.com' } }),
      );
      // mockHttpService.get.mockReturnValueOnce(of(mockBatchLocationData));
      jest.spyOn(service, 'queryBatchApi').mockImplementationOnce(async () => {
        return mockBatchLocationData;
      });
      const result = await service.getLocations('2022-01-01T12:00:00');
      expect(result).toEqual({
        data: [
          {
            cameraLocation: 'Location 1, Singapore',
            location: {
              latitude: 1,
              longitude: 2,
            },
            locationData: {
              formatted: 'Location 1, Singapore',
              query: {
                lat: 1,
                lon: 2,
              },
              name: 'Location 1',
            },
            nearest: {
              latitude: 1,
              longitude: 2,
              name: 'Location 1',
            },
          },
        ],
      });
    });
    it('should throw an error', async () => {
      mockHttpService.get.mockReturnValueOnce(
        throwError(() => 'No Traffic Images Found'),
      );
      await expect(service.getLocations('2022-01-01T12:00:00')).rejects.toThrow(
        'No Traffic Images Found',
      );
    });
  });
  describe('queryBatchApi', () => {
    it('should resolve with batch data after multiple attempts', async () => {
      const mockCachedUrl = 'https://test.com/cached-url';
      const mockBatchData = [{ location: 'data' }];

      mockHttpService.get
        .mockReturnValueOnce(of({ status: 202 })) // First attempt returns status 202
        .mockReturnValueOnce(of({ status: 200, data: mockBatchData })); // attempt returns status 200 with data
      const resultPromise = service.queryBatchApi(mockCachedUrl);
      const result = await resultPromise;
      expect(result).toEqual(mockBatchData);
    });
  });
});
