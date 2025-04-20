import { Test, TestingModule } from '@nestjs/testing';
import { ZoneTypesController } from './zone_types.controller';
import { ZoneTypesService } from './zone_types.service';

describe('ZoneTypesController', () => {
  let controller: ZoneTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZoneTypesController],
      providers: [ZoneTypesService],
    }).compile();

    controller = module.get<ZoneTypesController>(ZoneTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
