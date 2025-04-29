import { Module } from '@nestjs/common';
import { DataAnalysisService } from './data_analysis.service';
import { DataAnalysisController } from './data_analysis.controller';

@Module({
  providers: [DataAnalysisService],
  controllers: [DataAnalysisController]
})
export class DataAnalysisModule {}
