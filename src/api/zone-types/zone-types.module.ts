import { Module } from '@nestjs/common';
import { ZoneTypesService } from './zone-types.service';
import { ZoneTypesController } from './zone-types.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [ZoneTypesController],
  providers: [ZoneTypesService, PrismaService],
})
export class ZoneTypesModule {}
