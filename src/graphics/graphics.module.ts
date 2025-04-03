import { Module } from '@nestjs/common';
import { GraphicsService } from './graphics.service';
import { GraphicsController } from './graphics.controller';
import { PrismaModule } from '../prisma/prisma.module';  

@Module({
  imports: [PrismaModule], 
  providers: [GraphicsService],
})
export class GraphicsModule {}

