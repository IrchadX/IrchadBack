import { Test, TestingModule } from '@nestjs/testing';
import { PoiCategoriesController } from './poi-categories.controller';
import { PoiCategoriesService } from './poi-categories.service';

describe('PoiCategoriesController', () => {
  let controller: PoiCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoiCategoriesController],
      providers: [PoiCategoriesService],
    }).compile();

    controller = module.get<PoiCategoriesController>(PoiCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
