import { Test, TestingModule } from '@nestjs/testing';
import { ZoneTypesService } from './zone-types.service';

describe('ZoneTypesService', () => {
  let service: ZoneTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZoneTypesService],
    }).compile();

    service = module.get<ZoneTypesService>(ZoneTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
