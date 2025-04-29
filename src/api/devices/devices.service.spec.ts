import { Test, TestingModule } from '@nestjs/testing';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/CreateDevice.dto';
import { UpdateDeviceDto } from './dto/UpdateDevice.dto';
import { PrismaService } from '@/prisma/prisma.service';

const mockPrismaService = {
  device: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  device_type: {
    findMany: jest.fn(),
  },
  state_type: {
    findMany: jest.fn(), 
  },
  user: {
    findMany: jest.fn(),
  }
};

describe('DeviceService', () => {
  let service: DeviceService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get<DeviceService>(DeviceService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDevices', () => {
    it('should return all devices', async () => {
      const mockDevices = [
        {
          id: 1,
          type_id: 1,
          software_version: '1.0.0',
          date_of_service: new Date('2023-01-01'),
          state_type_id: 1,
          mac_address: '00:1A:2B:3C:4D:5E',
          user_id: 1,
          comm_state: true,
          battery_capacity: 80,
          connection_state: true,
        },
      ];

      mockPrismaService.device.findMany.mockResolvedValue(mockDevices);

      const result = await service.getDevices();
      
      expect(prisma.device.findMany).toHaveBeenCalled();
      expect(result).toEqual([
        {
          type_id: 1,
          software_version: '1.0.0',
          date_of_service: mockDevices[0].date_of_service.toISOString(),
          state_type_id: 1,
          mac_address: '00:1A:2B:3C:4D:5E',
          user_id: 1,
          comm_state: true,
          battery_capacity: 80,
        },
      ]);
    });
  });

  describe('getDeviceById', () => {
    it('should return a device by id', async () => {
      const mockDevice = {
        id: 1,
        type_id: 1,
        software_version: '1.0.0',
        date_of_service: new Date('2023-01-01'),
        state_type_id: 1,
        mac_address: '00:1A:2B:3C:4D:5E',
        user_id: 1,
        comm_state: true,
        battery_capacity: 80,
        connection_state: true,
      };

      mockPrismaService.device.findUnique.mockResolvedValue(mockDevice);

      const result = await service.getDeviceById(1);
      
      expect(prisma.device.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockDevice);
    });

    it('should return null if device not found', async () => {
      mockPrismaService.device.findUnique.mockResolvedValue(null);

      const result = await service.getDeviceById(999);
      
      expect(prisma.device.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe('createDevice', () => {
    it('should create a new device', async () => {
      const createDeviceDto: CreateDeviceDto = {
        type_id: 1,
        software_version: '1.0.0',
        date_of_service: '2023-01-01T00:00:00.000Z',
        state_type_id: 1,
        mac_address: '00:1A:2B:3C:4D:5E',
        user_id: 1,
        comm_state: true,
        battery_capacity: 80,
      };

      const mockCreatedDevice = {
        id: 1,
        ...createDeviceDto,
        date_of_service: new Date(createDeviceDto.date_of_service),
        connection_state: true,
      };

      mockPrismaService.device.create.mockResolvedValue(mockCreatedDevice);

      const result = await service.createDevice(createDeviceDto);
      
      expect(prisma.device.create).toHaveBeenCalledWith({
        data: createDeviceDto
      });
      expect(result).toEqual(mockCreatedDevice);
    });
  });

  describe('updateDevice', () => {
    it('should update a device', async () => {
      const updateDeviceDto: UpdateDeviceDto = {
        software_version: '2.0.0',
        battery_capacity: 90,
      };

      const mockUpdatedDevice = {
        id: 1,
        type_id: 1,
        software_version: '2.0.0',
        date_of_service: new Date('2023-01-01'),
        state_type_id: 1,
        mac_address: '00:1A:2B:3C:4D:5E',
        user_id: 1,
        comm_state: true,
        battery_capacity: 90,
        connection_state: true,
      };

      mockPrismaService.device.update.mockResolvedValue(mockUpdatedDevice);

      const result = await service.updateDevice(1, updateDeviceDto);
      
      expect(prisma.device.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDeviceDto
      });
      expect(result).toEqual(mockUpdatedDevice);
    });
  });  

  describe('setUser', () => {
    it('should set a user for a device', async () => {
      const mockUpdatedDevice = {
        id: 1,
        type_id: 1,
        software_version: '1.0.0',
        date_of_service: new Date('2023-01-01'),
        state_type_id: 1,
        mac_address: '00:1A:2B:3C:4D:5E',
        user_id: 2, // Updated user_id
        comm_state: true,
        battery_capacity: 80,
        connection_state: true,
      };

      mockPrismaService.device.update.mockResolvedValue(mockUpdatedDevice);

      const result = await service.setUser(1, 2);
      
      expect(prisma.device.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { user_id: 2 }
      });
      expect(result).toEqual(mockUpdatedDevice);
    });
  });

  describe('deleteDvice', () => {
    it('should delete a device', async () => {
      const mockDeletedDevice = {
        id: 1,
        type_id: 1,
        software_version: '1.0.0',
        date_of_service: new Date('2023-01-01'),
        state_type_id: 1,
        mac_address: '00:1A:2B:3C:4D:5E',
        user_id: 1,
        comm_state: true,
        battery_capacity: 80,
        connection_state: true,
      };

      mockPrismaService.device.delete.mockResolvedValue(mockDeletedDevice);

      const result = await service.deleteDvice(1);
      
      expect(prisma.device.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toEqual(mockDeletedDevice);
    });
  });

  describe('getDeviceByUserId', () => {
    it('should return devices by user id', async () => {
      const mockDevices = [
        {
          id: 1,
          type_id: 1,
          software_version: '1.0.0',
          date_of_service: new Date('2023-01-01'),
          state_type_id: 1,
          mac_address: '00:1A:2B:3C:4D:5E',
          user_id: 1,
          comm_state: true,
          battery_capacity: 80,
          connection_state: true,
        },
      ];

      mockPrismaService.device.findMany.mockResolvedValue(mockDevices);

      const result = await service.getDeviceByUserId(1);
      
      expect(prisma.device.findMany).toHaveBeenCalledWith({
        where: { user_id: 1 }
      });
      expect(result).toEqual(mockDevices);
    });
  });

  describe('getDeviceByTypeId', () => {
    it('should return devices by type id', async () => {
      const mockDevices = [
        {
          id: 1,
          type_id: 1,
          software_version: '1.0.0',
          date_of_service: new Date('2023-01-01'),
          state_type_id: 1,
          mac_address: '00:1A:2B:3C:4D:5E',
          user_id: 1,
          comm_state: true,
          battery_capacity: 80,
          connection_state: true,
        },
      ];

      mockPrismaService.device.findMany.mockResolvedValue(mockDevices);

      const result = await service.getDeviceByTypeId(1);
      
      expect(prisma.device.findMany).toHaveBeenCalledWith({
        where: { type_id: 1 }
      });
      expect(result).toEqual(mockDevices);
    });
  });

  describe('getDeviceByStateId', () => {
    it('should return devices by state id', async () => {
      const mockDevices = [
        {
          id: 1,
          type_id: 1,
          software_version: '1.0.0',
          date_of_service: new Date('2023-01-01'),
          state_type_id: 1,
          mac_address: '00:1A:2B:3C:4D:5E',
          user_id: 1,
          comm_state: true,
          battery_capacity: 80,
          connection_state: true,
        },
      ];

      mockPrismaService.device.findMany.mockResolvedValue(mockDevices);

      const result = await service.getDeviceByStateId(1);
      
      expect(prisma.device.findMany).toHaveBeenCalledWith({
        where: { state_type_id: 1 }
      });
      expect(result).toEqual(mockDevices);
    });
  });

  describe('getDeviceTypes', () => {
    it('should return all device types', async () => {
      const mockDeviceTypes = [
        { id: 1, type: 'Type 1' },
        { id: 2, type: 'Type 2' },
      ];

      mockPrismaService.device_type.findMany.mockResolvedValue(mockDeviceTypes);

      const result = await service.getDeviceTypes();
      
      expect(prisma.device_type.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockDeviceTypes);
    });
  });

  describe('getStateTypes', () => {
    it('should return all state types', async () => {
      const mockStateTypes = [
        { id: 1, state: 'State 1' },
        { id: 2, state: 'State 2' },
      ];

      mockPrismaService.state_type.findMany.mockResolvedValue(mockStateTypes);

      const result = await service.getStateTypes();
      
      expect(prisma.state_type.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockStateTypes);
    });
  });

  describe('getUsersWithNoDevices', () => {
    it('should return users with no devices', async () => {
      const mockUsers = [
        { 
          id: 1, 
          email: 'user@example.com',
          userTypeId: 7,
          userType: { id: 7, type: 'Regular User', created_at: new Date() }
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getUsersWithNoDevices();
      
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          userTypeId: 7,
          device: {
            none: {}
          }
        },
        include: {
          userType: true
        }
      });
      expect(result).toEqual(mockUsers);
    });
  });
});