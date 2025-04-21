import { Test, TestingModule } from '@nestjs/testing';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OffersController', () => {
  let controller: OffersController;
  let service: OffersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OffersController],
      providers: [
        {
          provide: OffersService,
          useValue: {
            getUserEnvironments: jest.fn(),
            calculateEnvironmentPricing: jest.fn(),
            getUserAccess: jest.fn(),
            getUserDevice: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OffersController>(OffersController);
    service = module.get<OffersService>(OffersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserEnvironments', () => {
    it('should return environments for a valid user', async () => {
      const mockEnvironments = [
        {
          id: 1,
          name: 'Env 1',
          description: 'Description 1',
          address: 'Address 1',
          is_public: true,
          surface: 100,
        },
      ];
      jest.spyOn(service, 'getUserEnvironments').mockResolvedValue(mockEnvironments);

      const result = await controller.getUserEnvironments(1);
      expect(result).toEqual(mockEnvironments);
      expect(service.getUserEnvironments).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if no environments are found', async () => {
      jest.spyOn(service, 'getUserEnvironments').mockResolvedValue([]);

      await expect(controller.getUserEnvironments(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on service error', async () => {
      jest.spyOn(service, 'getUserEnvironments').mockRejectedValue(new Error('Service error'));

      await expect(controller.getUserEnvironments(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('calculateEnvironmentPricing', () => {
    it('should return pricing for environments', async () => {
      const mockPricing = [
        {
          id: 1,
          price: '100.00',
          name: 'Env 1',
          description: 'Description 1',
          address: 'Address 1',
          surface: 100,
        },
      ];
      jest.spyOn(service, 'calculateEnvironmentPricing').mockResolvedValue(mockPricing);

      const result = await controller.calculateEnvironmentPricing(1);
      expect(result).toEqual(mockPricing);
      expect(service.calculateEnvironmentPricing).toHaveBeenCalledWith(1);
    });
  });

  describe('getUserPublicEnvironments', () => {
    it('should return public access price', async () => {
      jest.spyOn(service, 'getUserAccess').mockResolvedValue('150.00');

      const result = await controller.getUserPublicEnvironments(1);
      expect(result).toEqual('150.00');
      expect(service.getUserAccess).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user access is not found', async () => {
      jest.spyOn(service, 'getUserAccess').mockRejectedValue(new NotFoundException());

      await expect(controller.getUserPublicEnvironments(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserDevice', () => {
    it('should return devices for a valid user', async () => {
      const mockDevices = [
        {
          id: 1,
          price: 100.0,
          date_of_service: new Date('2023-01-01'),
          device_type: { type: 'Device 1' },
        },
      ];
      jest.spyOn(service, 'getUserDevice').mockResolvedValue(mockDevices);

      const result = await controller.getUserDevice(1);
      expect(result).toEqual(mockDevices);
      expect(service.getUserDevice).toHaveBeenCalledWith(1);
    });
  });
});