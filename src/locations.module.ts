import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { WeatherService } from './weather.service';
import { RedisService } from './redis.service';

@Module({
  imports: [HttpModule],
  controllers: [LocationsController],
  providers: [LocationsService, WeatherService, RedisService],
})
export class LocationsModule {}
