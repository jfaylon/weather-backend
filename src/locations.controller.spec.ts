import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

class LocationsServiceMock {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLocations(dateTime: string): Promise<any> {
    return Promise.resolve({ data: [] });
  }
}

describe('LocationsController', () => {
  let controller: LocationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationsService,
          useClass: LocationsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
  });

  describe('getLocations', () => {
    it('should call getLocations', async () => {
      const dateTime = '2024-01-01T12:00:00';

      jest
        .spyOn(controller['locationsService'], 'getLocations')
        .mockImplementationOnce(() => Promise.resolve({ data: [] }));

      const result = await controller.getLocations(dateTime);

      expect(controller['locationsService'].getLocations).toHaveBeenCalledWith(
        dateTime,
      );
      expect(result).toEqual({ data: [] });
    });
  });
});
