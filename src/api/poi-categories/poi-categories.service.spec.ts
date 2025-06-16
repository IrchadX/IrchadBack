import { Test, TestingModule } from '@nestjs/testing';
import { PoiCategoriesService } from './poi-categories.service';

describe('PoiCategoriesService', () => {
  let service: PoiCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoiCategoriesService],
    }).compile();

    service = module.get<PoiCategoriesService>(PoiCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
