import { Test, TestingModule } from '@nestjs/testing';
import { DataAnalysisService } from './data_analysis.service';

describe('DataAnalysisService', () => {
  let service: DataAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataAnalysisService],
    }).compile();

    service = module.get<DataAnalysisService>(DataAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
