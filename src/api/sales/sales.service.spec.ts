import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SalesService', () => {
  let service: SalesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    purchase_history: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    device_type: {
      findMany: jest.fn(),
    },
    expense: {
      findMany: jest.fn(),
    },
    environment: {
      findMany: jest.fn(),
    },
    pricing: {
      findFirst: jest.fn(),
    },
    market_potentiel: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPurchaseHistory', () => {
    it('should return purchase history with user and device details', async () => {
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

      mockPrismaService.purchase_history.findMany.mockResolvedValue(mockPurchaseHistory);

      const result = await service.getPurchaseHistory();

      expect(result).toEqual(mockPurchaseHistory);
      expect(mockPrismaService.purchase_history.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              first_name: true,
              family_name: true,
              city: true,
            },
          },
          device: {
            select: {
              device_type: true,
            },
          },
        },
      });
    });
  });

  describe('addPurchase', () => {
    it('should create a new purchase record', async () => {
      const mockPurchase = {
        id: 1,
        user_id: 1,
        device_id: 1,
        public: true,
      };

      mockPrismaService.purchase_history.create.mockResolvedValue(mockPurchase);

      const result = await service.addPurchase(1, 1, true);

      expect(result).toEqual(mockPurchase);
      expect(mockPrismaService.purchase_history.create).toHaveBeenCalledWith({
        data: {
          user_id: 1,
          device_id: 1,
          public: true,
        },
      });
    });
  });

  describe('getMonthlyRevenue', () => {
    it('should calculate monthly revenue correctly', async () => {
      const mockDate = new Date('2024-01-01');
      const mockPrivateRevenue = 1000;
      const mockPublicRevenue = 500;
      const mockDeviceRevenue = 2000;

      jest.spyOn(service, 'getPrivatePurchasesPrice').mockResolvedValue(mockPrivateRevenue);
      jest.spyOn(service, 'getPublicAccessPurchasesPrice').mockResolvedValue(mockPublicRevenue);
      jest.spyOn(service, 'getDevicePurchasesPrice').mockResolvedValue(mockDeviceRevenue);

      const result = await service.getMonthlyRevenue(mockDate);

      expect(result).toEqual({
        privateRevenue: mockPrivateRevenue,
        publicRevenue: mockPublicRevenue,
        deviceRevenue: mockDeviceRevenue,
        totalRevenue: mockPrivateRevenue + mockPublicRevenue + mockDeviceRevenue,
      });
    });
  });

  describe('getSalesCountByDeviceType', () => {
    it('should return sales count by device type', async () => {
      const mockDeviceTypes = [
        {
          type: 'Type A',
          device: [
            {
              purchase_history: [{ id: 1 }, { id: 2 }],
            },
          ],
        },
        {
          type: 'Type B',
          device: [
            {
              purchase_history: [{ id: 3 }],
            },
          ],
        },
      ];

      mockPrismaService.device_type.findMany.mockResolvedValue(mockDeviceTypes);

      const result = await service.getSalesCountByDeviceType();

      expect(result).toEqual([
        { model: 'Type A', sales: 2 },
        { model: 'Type B', sales: 1 },
      ]);
    });
  });

  describe('getMarketPenetrationByRegion', () => {
    it('should calculate market penetration by region', async () => {
      const mockDate = new Date('2024-01-01');
      const mockSalesByCity = [
        { user_id: 1, _count: { _all: 2 } },
        { user_id: 2, _count: { _all: 3 } },
      ];

      const mockUsers = [
        { id: 1, city: 'City A' },
        { id: 2, city: 'City B' },
      ];

      const mockMarketPotentials = [
        { city: 'City A', potential_value: 1000 },
        { city: 'City B', potential_value: 2000 },
      ];

      mockPrismaService.purchase_history.groupBy.mockResolvedValue(mockSalesByCity);
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.market_potentiel.findMany.mockResolvedValue(mockMarketPotentials);

      const result = await service.getMarketPenetrationByRegion(mockDate);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('region', 'City A');
      expect(result[0]).toHaveProperty('penetration');
      expect(result[0]).toHaveProperty('totalCustomers');
      expect(result[0]).toHaveProperty('potentialMarket');
    });
  });
}); 