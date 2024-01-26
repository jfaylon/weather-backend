import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocationsModule } from './locations.module';
import { WeatherModule } from './weather.module';

@Module({
  imports: [LocationsModule, WeatherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
