import { Test, TestingModule } from '@nestjs/testing';
import { DataAnalysisController } from './data_analysis.controller';

describe('DataAnalysisController', () => {
  let controller: DataAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataAnalysisController],
    }).compile();

    controller = module.get<DataAnalysisController>(DataAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
