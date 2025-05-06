import { Module } from '@nestjs/common';
import { DataAnalysisService } from './data_analysis.service';
import { DataAnalysisController } from './data_analysis.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], 
  controllers: [DataAnalysisController],
  providers: [DataAnalysisService],
})
export class DataAnalysisModule {}
