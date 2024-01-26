import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @Get()
  getWeather(
    @Query('dateTime') dateTime: string,
    @Query('location') location: string,
  ) {
    return this.weatherService.getWeatherData(dateTime, location);
  }
}
