import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

describe('SalesController', () => {
  let controller: SalesController;
  let service: SalesService;

  const mockSalesService = {
    getPurchaseHistory: jest.fn(),
    addPurchase: jest.fn(),
    getMonthlyRevenue: jest.fn(),
    getDailySalesCount: jest.fn(),
    getMonthlySalesCount: jest.fn(),
    getYearlySalesCount: jest.fn(),
    getSalesCountByDeviceType: jest.fn(),
    getSalesCountByRegion: jest.fn(),
    getCOGS: jest.fn(),
    getExpenses: jest.fn(),
    calculateGrossMargin: jest.fn(),
    calculateNetMargin: jest.fn(),
    getMarketPenetrationByRegion: jest.fn(),
    getMonthlyProductsSold: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
    service = module.get<SalesService>(SalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPurchaseHistory', () => {
    it('should return purchase history', async () => {
      const mockPurchaseHistory = [
        {
          id: 1,
          user: {
            first_name: 'John',
            family_name: 'Doe',
            city: 'New York',
          },
          device: {
            device_type: 'Type A',
          },
        },
      ];

      mockSalesService.getPurchaseHistory.mockResolvedValue(mockPurchaseHistory);

      const result = await controller.getPurchaseHistory();

      expect(result).toEqual(mockPurchaseHistory);
      expect(mockSalesService.getPurchaseHistory).toHaveBeenCalled();
    });
  });

  describe('addPurchase', () => {
    it('should add a new purchase', async () => {
      const mockPurchase = {
        id: 1,
        user_id: 1,
        device_id: 1,
        public: true,
      };

      mockSalesService.addPurchase.mockResolvedValue(mockPurchase);

      const result = await controller.addPurchase(1, 1, true);

      expect(result).toEqual(mockPurchase);
      expect(mockSalesService.addPurchase).toHaveBeenCalledWith(1, 1, true);
    });
  });

  describe('getMonthlyRevenue', () => {
    it('should return monthly revenue for valid date', async () => {
      const mockDate = '2024-01-01';
      const mockRevenue = {
        privateRevenue: 1000,
        publicRevenue: 500,
        deviceRevenue: 2000,
        totalRevenue: 3500,
      };

      mockSalesService.getMonthlyRevenue.mockResolvedValue(mockRevenue);

      const result = await controller.getMonthlyRevenue(mockDate);

      expect(result).toEqual(mockRevenue);
      expect(mockSalesService.getMonthlyRevenue).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should throw error for invalid date', async () => {
      const invalidDate = 'invalid-date';

      await expect(controller.getMonthlyRevenue(invalidDate)).rejects.toThrow('Invalid date format');
      expect(mockSalesService.getMonthlyRevenue).not.toHaveBeenCalled();
    });
  });

  describe('getDailySalesCount', () => {
    it('should return daily sales count for valid date', async () => {
      const mockDate = '2024-01-01';
      const mockSales = [
        { date: '2024-01-01', count: 5 },
        { date: '2024-01-02', count: 3 },
      ];

      mockSalesService.getDailySalesCount.mockResolvedValue(mockSales);

      const result = await controller.getDailySalesCount(mockDate);

      expect(result).toEqual(mockSales);
      expect(mockSalesService.getDailySalesCount).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should throw error for invalid date', async () => {
      const invalidDate = 'invalid-date';

      await expect(controller.getDailySalesCount(invalidDate)).rejects.toThrow('Invalid date format');
      expect(mockSalesService.getDailySalesCount).not.toHaveBeenCalled();
    });
  });

  describe('getMarketPenetration', () => {
    it('should return market penetration data for valid date', async () => {
      const mockDate = '2024-01-01';
      const mockData = [
        {
          region: 'City A',
          penetration: 25.5,
          totalCustomers: 255,
          potentialMarket: 1000,
        },
      ];

      mockSalesService.getMarketPenetrationByRegion.mockResolvedValue(mockData);

      const result = await controller.getMarketPenetration(mockDate);

      expect(result).toEqual(mockData);
      expect(mockSalesService.getMarketPenetrationByRegion).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should throw error for invalid date', async () => {
      const invalidDate = 'invalid-date';

      await expect(controller.getMarketPenetration(invalidDate)).rejects.toThrow('Invalid date format');
      expect(mockSalesService.getMarketPenetrationByRegion).not.toHaveBeenCalled();
    });
  });

  describe('getMonthlyProducts', () => {
    it('should return monthly products data for valid date', async () => {
      const mockDate = '2024-01-01';
      const mockData = {
        totalProducts: 100,
        month: 'janvier 2024',
      };

      mockSalesService.getMonthlyProductsSold.mockResolvedValue(mockData);

      const result = await controller.getMonthlyProducts(mockDate);

      expect(result).toEqual(mockData);
      expect(mockSalesService.getMonthlyProductsSold).toHaveBeenCalledWith(expect.any(Date));
    });

    it('should throw error for invalid date', async () => {
      const invalidDate = 'invalid-date';

      await expect(controller.getMonthlyProducts(invalidDate)).rejects.toThrow('Invalid date format');
      expect(mockSalesService.getMonthlyProductsSold).not.toHaveBeenCalled();
    });
  });
}); 