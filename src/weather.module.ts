import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { RedisService } from './redis.service';
import { WeatherController } from './weather.controller';

@Module({
  imports: [HttpModule],
  controllers: [WeatherController],
  providers: [WeatherService, RedisService],
})
export class WeatherModule {}
