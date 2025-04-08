import { Test, TestingModule } from '@nestjs/testing';
import { GraphicsController } from './graphics.controller';
import { GraphicsService } from './graphics.service';

describe('GraphicsController', () => {
  let controller: GraphicsController;
  let service: GraphicsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GraphicsController],
      providers: [
        {
          provide: GraphicsService,
          useValue: {
            getPannesByDeviceType: jest.fn(),
            getGlobalSalesByMonth: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GraphicsController>(GraphicsController);
    service = module.get<GraphicsService>(GraphicsService);
  });

  describe('getPannesByDeviceType', () => {
    it('should return pannes statistics from service', async () => {
      const mockStats = [
        { deviceType: 'Capteur', percentage: '50.00', count: 2 },
      ];

      (service.getPannesByDeviceType as jest.Mock).mockResolvedValue(mockStats);

      const result = await controller.getPannesByDeviceType();
      expect(result).toEqual(mockStats);
      expect(service.getPannesByDeviceType).toHaveBeenCalled();
    });
  });

  describe('getGlobalSalesByMonth', () => {
    it('should return sales stats from service', async () => {
      const mockSales = [
        { month: 'Jan', sales: 2 },
        { month: 'Feb', sales: 0 },
      ];

      (service.getGlobalSalesByMonth as jest.Mock).mockResolvedValue(mockSales);

      const result = await controller.getGlobalSalesByMonth();
      expect(result).toEqual(mockSales);
      expect(service.getGlobalSalesByMonth).toHaveBeenCalled();
    });
  });
});
