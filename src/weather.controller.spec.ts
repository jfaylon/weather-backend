/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { Forecast } from './interfaces/weather.interface';

class WeatherServiceMock {
  getWeatherData(
    dateTime: string,
    location: string,
  ): Promise<{
    locationDateTimeWeatherDetails: Forecast;
  }> {
    // Provide your mocked implementation here
    return Promise.resolve({
      locationDateTimeWeatherDetails: {
        area: 'test',
        forecast: 'Cloudy',
      },
    });
  }
}

describe('WeatherController', () => {
  let controller: WeatherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useClass: WeatherServiceMock,
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
  });

  describe('getWeather', () => {
    it('should call WeatherService.getWeatherData with correct parameters', async () => {
      const dateTime = '2024-01-01T12:00:00';
      const location = 'TestLocation';

      jest
        .spyOn(controller['weatherService'], 'getWeatherData')
        .mockImplementationOnce(() =>
          Promise.resolve({
            locationDateTimeWeatherDetails: {
              area: 'test',
              forecast: 'Cloudy',
            },
          }),
        );

      const result = await controller.getWeather(dateTime, location);

      expect(controller['weatherService'].getWeatherData).toHaveBeenCalledWith(
        dateTime,
        location,
      );
      expect(result).toEqual({
        locationDateTimeWeatherDetails: {
          area: 'test',
          forecast: 'Cloudy',
        },
      });
    });
  });
});
