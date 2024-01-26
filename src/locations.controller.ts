import { Controller, Get, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { GetLocationPayload } from './interfaces/location.interface';

@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get()
  getLocations(
    @Query('dateTime') dateTime: string,
  ): Promise<GetLocationPayload> {
    return this.locationsService.getLocations(dateTime);
  }
}
