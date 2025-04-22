import { Test, TestingModule } from '@nestjs/testing';
import { OffersService } from './offers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('OffersService', () => {
  let service: OffersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 1,
    created_at: new Date(),
    family_name: 'Doe',
    first_name: 'John',
    phone_number: '123456789',
    password: 'hashedpassword',
    userTypeId: 1,
    email: 'john.doe@example.com',
    sex: 'M',
    street: '123 Main St',
    city: 'Sample City',
    birth_date: new Date('1990-01-01'),
    Identifier: '123456789',
  };

  const mockEnvironments = [
    {
      id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      name: 'Env 1',
      description: 'Description 1',
      address: 'Address 1',
      map_id: null,
      is_public: true,
      surface: 100,
    },
  ];

  const mockPricing = {
    id: 1,
    price: 150,
    attribute: 'public',
  };

  const mockAccess = {
    id: 1,
    user_id: 1,
    device_id: null,
    date: new Date(),
    public: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            environment: {
              findMany: jest.fn(),
            },
            pricing: {
              findFirst: jest.fn(),
            },
            purchase_history: {
              findFirst: jest.fn(),
            },
            device: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserEnvironments', () => {
    it('should return environments for a valid user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.environment, 'findMany').mockResolvedValue(mockEnvironments);

      const result = await service.getUserEnvironments(1);
      expect(result).toEqual(mockEnvironments);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.environment.findMany).toHaveBeenCalledWith({
        where: {
          env_user: {
            some: {
              user_id: 1,
            },
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          address: true,
          surface: true,
          is_public: true,
        },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getUserEnvironments(1)).rejects.toThrow(
        new NotFoundException(`Utilisateur avec l'ID 1 introuvable`),
      );
    });

    it('should throw NotFoundException if no environments are found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.environment, 'findMany').mockResolvedValue([]);

      await expect(service.getUserEnvironments(1)).rejects.toThrow(
        new NotFoundException(`Aucun environnement trouvé pour l'utilisateur avec l'ID 1`),
      );
    });
  });

  describe('calculateEnvironmentPricing', () => {
    it('should calculate pricing for environments', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.environment, 'findMany').mockResolvedValue(mockEnvironments);
      jest.spyOn(prisma.pricing, 'findFirst').mockResolvedValue(mockPricing);

      const result = await service.calculateEnvironmentPricing(1);
      expect(result).toEqual([
        {
          ...mockEnvironments[0],
          price: '15000.00',
        },
      ]);
    });

    it('should throw NotFoundException if pricing is not defined', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.environment, 'findMany').mockResolvedValue(mockEnvironments);
      jest.spyOn(prisma.pricing, 'findFirst').mockResolvedValue(null);

      await expect(service.calculateEnvironmentPricing(1)).rejects.toThrow(
        new NotFoundException('Tarif unitaire non défini dans la table pricing'),
      );
    });
  });

  describe('getUserAccess', () => {
    it('should return public pricing if user has access', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.purchase_history, 'findFirst').mockResolvedValue(mockAccess);
      jest.spyOn(prisma.pricing, 'findFirst').mockResolvedValue(mockPricing);
  
      const result = await service.getUserAccess(1);
      expect(result).toEqual('150.00');
    });
  
    it('should return 0 if user does not have public access', async () => {
      const mockAccessWithoutPublic = { ...mockAccess, public: false };
  
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.purchase_history, 'findFirst').mockResolvedValue(mockAccessWithoutPublic);
      jest.spyOn(prisma.pricing, 'findFirst').mockResolvedValue(mockPricing); // Ajout du mock
  
      const result = await service.getUserAccess(1);
      expect(result).toEqual(0);
    });
  
    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
  
      await expect(service.getUserAccess(1)).rejects.toThrow(
        new NotFoundException(`Utilisateur avec l'ID 1 introuvable`),
      );
    });
  
    it('should throw NotFoundException if access is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.purchase_history, 'findFirst').mockResolvedValue(null);
  
      await expect(service.getUserAccess(1)).rejects.toThrow(
        new NotFoundException(`Aucun accès trouvé pour l'utilisateur avec l'ID 1`),
      );
    });
  });
});