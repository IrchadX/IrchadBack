import { Module } from '@nestjs/common';
import { PoiCategoriesService } from './poi-categories.service';
import { PoiCategoriesController } from './poi-categories.controller';
import { PrismaService } from '@/prisma/prisma.service';
@Module({
  controllers: [PoiCategoriesController],
  providers: [PoiCategoriesService, PrismaService],
})
export class PoiCategoriesModule {}
