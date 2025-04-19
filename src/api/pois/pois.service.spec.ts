import { Test, TestingModule } from '@nestjs/testing';
import { PoisService } from './pois.service';

describe('PoisService', () => {
  let service: PoisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoisService],
    }).compile();

    service = module.get<PoisService>(PoisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
