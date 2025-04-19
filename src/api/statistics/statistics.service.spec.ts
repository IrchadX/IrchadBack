import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatisticsService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          count: jest.fn(),
        },
        alert: {
          count: jest.fn(),
          findMany: jest.fn(),
        },
        device: {
          count: jest.fn(),
        },
        intervention_history: {
          count: jest.fn(),
        },
        $queryRaw: jest.fn(),
      })
      .compile();
    service = module.get<StatisticsService>(StatisticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getUserCount', () => {
    it('should return the correct number of users', async () => {
      (prisma.user.count as jest.Mock).mockResolvedValueOnce(5);
      const count = await service.getUserCount();
      expect(count).toBe(5);
    });
  });

  describe('getAlertsCount', () => {
    it('should return the correct number of alerts for the current month', async () => {
      (prisma.alert.count as jest.Mock).mockResolvedValueOnce(10);
      const count = await service.getAlertsCount();
      expect(count).toBe(10);
    });
  });

  describe('getDeviceCount', () => {
    it('should return the correct number of devices for the current month', async () => {
      (prisma.device.count as jest.Mock).mockResolvedValueOnce(8);
      const count = await service.getDeviceCount();
      expect(count).toBe(8);
    });
  });

  describe('getInactiveDeviceCount', () => {
    it('should return the correct number of inactive devices', async () => {
      (prisma.device.count as jest.Mock).mockResolvedValueOnce(3);
      const count = await service.getInactiveDeviceCount();
      expect(count).toBe(3);
    });
  });

  describe('getAverageInterventionDuration', () => {
    it('should return the correct average intervention duration', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ avg_duration: 1.5 }]);
      const duration = await service.getAverageInterventionDuration();
      expect(duration).toBe(1.5);
    });

    it('should return null if there are no completed interventions', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ avg_duration: null }]);
      const duration = await service.getAverageInterventionDuration();
      expect(duration).toBeNull();
    });
  });

  describe('getAllAlerts', () => {
    it('should return all alerts', async () => {
      (prisma.alert.findMany as jest.Mock).mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      const alerts = await service.getAllAlerts();
      expect(alerts.length).toBe(2);
    });
  });

  describe('getTechnicalInterventionPercentage', () => {
    it('should return the correct percentage of technical interventions', async () => {
      // Mock total interventions = 3, technical interventions = 2
      (prisma.intervention_history.count as jest.Mock)
        .mockResolvedValueOnce(3)   // total
        .mockResolvedValueOnce(2);   // techniques

      const percentage = await service.getTechnicalInterventionPercentage();
      expect(percentage).toBeCloseTo(66.67, 2); // Compare avec une marge de 2 décimales
    });

    it('should return 0 if there are no interventions', async () => {
      (prisma.intervention_history.count as jest.Mock)
        .mockResolvedValueOnce(0); // total interventions = 0
      const percentage = await service.getTechnicalInterventionPercentage();
      expect(percentage).toBe(0);
    });
  });
});
