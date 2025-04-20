import { Module } from '@nestjs/common';
import { ZoneTypesService } from './zone_types.service';
import { ZoneTypesController } from './zone_types.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [ZoneTypesController],
  providers: [ZoneTypesService, PrismaService],
})
export class ZoneTypesModule {}
