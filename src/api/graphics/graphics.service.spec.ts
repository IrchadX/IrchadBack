import { Test, TestingModule } from '@nestjs/testing';
import { GraphicsService } from './graphics.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('GraphicsService', () => {
  let service: GraphicsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphicsService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue({
        panne_history: {
          findMany: jest.fn(),
        },
        purchase_history: {
          findMany: jest.fn(),
        },
      })
      .compile();

    service = module.get<GraphicsService>(GraphicsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getPannesByDeviceType', () => {
    it('should return correct stats for pannes by device type', async () => {
      const mockPannes = [
        {
          alert: {
            device: {
              device_type: { type: 'Capteur' },
            },
          },
        },
        {
          alert: {
            device: {
              device_type: { type: 'Capteur' },
            },
          },
        },
        {
          alert: {
            device: {
              device_type: { type: 'Caméra' },
            },
          },
        },
      ];

      (prisma.panne_history.findMany as jest.Mock).mockResolvedValue(
        mockPannes,
      );

      const result = await service.getPannesByDeviceType();

      expect(result).toEqual([
        { deviceType: 'Capteur', percentage: '66.67', count: 2 },
        { deviceType: 'Caméra', percentage: '33.33', count: 1 },
      ]);
    });
  });

  describe('getGlobalSalesByMonth', () => {
    it('should return correct monthly sales data', async () => {
      const mockSales = [
        { date: new Date(`${new Date().getFullYear()}-01-15`) },
        { date: new Date(`${new Date().getFullYear()}-01-20`) },
        { date: new Date(`${new Date().getFullYear()}-03-10`) },
      ];

      (prisma.purchase_history.findMany as jest.Mock).mockResolvedValue(
        mockSales,
      );

      const result = await service.getGlobalSalesByMonth();

      expect(result).toEqual(
        expect.arrayContaining([
          { month: 'Jan', sales: 2 },
          { month: 'Mar', sales: 1 },
          { month: 'Fev', sales: 0 },
        ]),
      );
    });
  });
});
