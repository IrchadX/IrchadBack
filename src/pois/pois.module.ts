import { Module } from '@nestjs/common';
import { PoisService } from './pois.service';
import { PoisController } from './pois.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PoisController],
  providers: [PoisService, PrismaService],
})
export class PoisModule {}
