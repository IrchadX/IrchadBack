import { Module } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { ZoneController } from './zone.controller';
import { PrismaModule } from 'src/prisma/prisma.module'; // <-- ici

@Module({
  imports: [PrismaModule], // <-- ici
  controllers: [ZoneController],
  providers: [ZoneService],
})
export class ZoneModule {}
