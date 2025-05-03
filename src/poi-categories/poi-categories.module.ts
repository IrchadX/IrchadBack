import { Module } from '@nestjs/common';
import { PoiCategoriesService } from './poi-categories.service';
import { PoiCategoriesController } from './poi-categories.controller';

@Module({
  controllers: [PoiCategoriesController],
  providers: [PoiCategoriesService],
})
export class PoiCategoriesModule {}
