import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/CreateDevice.dto';
import { UpdateDeviceDto } from './dto/UpdateDevice.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

const mockDevice = {
  id: 1,
  type_id: 2,
  state_type_id: 3,
  user_id: 4,
  mac_address: '00:1B:44:11:3A:B7',
  software_version: 'v1.0.0',
  date_of_service: new Date().toISOString(), 
  comm_state: true,
  connection_state: false,
  battery_capacity: 100,
};

const mockDevices = [mockDevice];
const mockDeviceTypes = [{ id: 1, type: 'Type 1' }];
const mockStateTypes = [{ id: 1, state: 'State 1' }];
const mockUsers = [{ id: 1, email: 'user@example.com', userTypeId: 7 }];

const mockDeviceService = {
  getDevices: jest.fn(),
  getDeviceById: jest.fn(),
  createDevice: jest.fn(),
  updateDevice: jest.fn(),
  deleteDvice: jest.fn(),
  getDeviceByUserId: jest.fn(),
  getDeviceByTypeId: jest.fn(),
  getDeviceTypes: jest.fn(),
  getStateTypes: jest.fn(),
  getUsersWithNoDevices: jest.fn(),
};

describe('DevicesController', () => {
  let controller: DevicesController;
  let service: DeviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        {
          provide: DeviceService,
          useValue: mockDeviceService,
        },
      ],
    }).compile();

    controller = module.get<DevicesController>(DevicesController);
    service = module.get<DeviceService>(DeviceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllDevices', () => {
    it('should return all devices', async () => {
      jest.spyOn(service, 'getDevices').mockResolvedValue(mockDevices);
      
      const result = await controller.getAllDevices();
      
      expect(service.getDevices).toHaveBeenCalled();
      expect(result).toEqual(mockDevices);
    });

    it('should throw an exception if service fails', async () => {
      jest.spyOn(service, 'getDevices').mockRejectedValue(new Error('Database error'));
      
      await expect(controller.getAllDevices()).rejects.toThrow(
        new HttpException('Failed to fetch devices', HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  });

  describe('createDevice', () => {
    it('should create a device', async () => {
      const mockDevice2 = {
        id: 1,
        type_id: 2,
        state_type_id: 3,
        user_id: 4,
        mac_address: '00:1B:44:11:3A:B7',
        software_version: 'v1.0.0',
        date_of_service: new Date('2023-01-01T00:00:00.000Z'), // Use a fixed date
        comm_state: true,
        connection_state: false,
        battery_capacity: 100,
      };
      
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
      
      jest.spyOn(service, 'createDevice').mockResolvedValue(mockDevice2);
      
      const result = await controller.createDevice(createDeviceDto);
      
      expect(service.createDevice).toHaveBeenCalledWith(createDeviceDto);
      expect(result).toEqual(mockDevice2); // Use mockDevice2 instead of mockDevice
    });

    it('should throw an exception if service fails to create', async () => {
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
      
      jest.spyOn(service, 'createDevice').mockRejectedValue(new Error('Database error'));
      
      await expect(controller.createDevice(createDeviceDto)).rejects.toThrow(
        new HttpException('Failed to create device', HttpStatus.BAD_REQUEST)
      );
    });
  });

  // describe('getDeviceTypes', () => {
  //   it('should return all device types', async () => {
  //     jest.spyOn(service, 'getDeviceTypes').mockResolvedValue(mockDeviceTypes);
      
  //     const result = await controller.getDeviceTypes();
      
  //     expect(service.getDeviceTypes).toHaveBeenCalled();
  //     expect(result).toEqual(mockDeviceTypes);
  //   });

  //   it('should throw an exception if service fails', async () => {
  //     jest.spyOn(service, 'getDeviceTypes').mockRejectedValue(new Error('Database error'));
      
  //     await expect(controller.getDeviceTypes()).rejects.toThrow(
  //       new HttpException('Failed to fetch device types', HttpStatus.INTERNAL_SERVER_ERROR)
  //     );
  //   });
  // });

  // describe('UsersWithNoDevicd', () => {
  //   it('should return users with no devices', async () => {
  //     jest.spyOn(service, 'getUsersWithNoDevices').mockResolvedValue(mockUsers);
      
  //     const result = await controller.UsersWithNoDevicd();
      
  //     expect(service.getUsersWithNoDevices).toHaveBeenCalled();
  //     expect(result).toEqual(mockUsers);
  //   });

  //   it('should throw an exception if service fails', async () => {
  //     jest.spyOn(service, 'getUsersWithNoDevices').mockRejectedValue(new Error('Database error'));
      
  //     await expect(controller.UsersWithNoDevicd()).rejects.toThrow(
  //       new HttpException('Failed to fetch state types', HttpStatus.INTERNAL_SERVER_ERROR)
  //     );
  //   });
  // });

  // describe('getDeviceById', () => {
  //   it('should return a device by id', async () => {
  //     jest.spyOn(service, 'getDeviceById').mockResolvedValue(mockDevice);
      
  //     const result = await controller.getDeviceById('1');
      
  //     expect(service.getDeviceById).toHaveBeenCalledWith(1);
  //     expect(result).toEqual(mockDevice);
  //   });

  //   it('should throw NotFoundException if device not found', async () => {
  //     jest.spyOn(service, 'getDeviceById').mockResolvedValue(null);
      
  //     await expect(controller.getDeviceById('999')).rejects.toThrow(
  //       new NotFoundException('Device with ID 999 not found')
  //     );
  //   });

  //   it('should throw HttpException if service fails', async () => {
  //     jest.spyOn(service, 'getDeviceById').mockRejectedValue(new Error('Database error'));
      
  //     await expect(controller.getDeviceById('1')).rejects.toThrow(
  //       new HttpException('Failed to fetch device77777777777', HttpStatus.INTERNAL_SERVER_ERROR)
  //     );
  //   });
  // });

  // describe('updateDevice', () => {
  //   it('should update a device', async () => {
  //     const updateDeviceDto: UpdateDeviceDto = {
  //       software_version: '2.0.0',
  //     };
      
  //     jest.spyOn(service, 'getDeviceById').mockResolvedValue(mockDevice);
  //     jest.spyOn(service, 'updateDevice').mockResolvedValue({
  //       ...mockDevice,
  //       software_version: '2.0.0',
  //     });
      
  //     const result = await controller.updateDevice('1', updateDeviceDto);
      
  //     expect(service.getDeviceById).toHaveBeenCalledWith(1);
  //     expect(service.updateDevice).toHaveBeenCalledWith(1, updateDeviceDto);
  //     expect(result.software_version).toEqual('2.0.0');
  //   });

  //   it('should throw NotFoundException if device not found', async () => {
  //     const updateDeviceDto: UpdateDeviceDto = {
  //       software_version: '2.0.0',
  //     };
      
  //     jest.spyOn(service, 'getDeviceById').mockResolvedValue(null);
      
  //     await expect(controller.updateDevice('999', updateDeviceDto)).rejects.toThrow(
  //       new NotFoundException('Device with ID 999 not found')
  //     );
      
  //     expect(service.updateDevice).not.toHaveBeenCalled();
  //   });

  //   it('should throw HttpException if service fails', async () => {
  //     const updateDeviceDto: UpdateDeviceDto = {
  //       software_version: '2.0.0',
  //     };
      
  //     jest.spyOn(service, 'getDeviceById').mockResolvedValue(mockDevice);
  //     jest.spyOn(service, 'updateDevice').mockRejectedValue(new Error('Database error'));
      
  //     await expect(controller.updateDevice('1', updateDeviceDto)).rejects.toThrow(
  //       new HttpException('Failed to update device', HttpStatus.INTERNAL_SERVER_ERROR)
  //     );
  //   });
  // });

  // describe('deleteDevice', () => {
  //   it('should delete a device', async () => {
  //     jest.spyOn(service, 'getDeviceById').mockResolvedValue(mockDevice);
  //     jest.spyOn(service, 'deleteDvice').mockResolvedValue(mockDevice);
       
  //     const result = await controller.deleteDevice('1');
      
  //     expect(service.getDeviceById).toHaveBeenCalledWith(1);
  //     expect(service.deleteDvice).toHaveBeenCalledWith(1);
  //     expect(result).toEqual(mockDevice);
  //   });

  //   it('should throw NotFoundException if device not found', async () => {
  //     jest.spyOn(service, 'getDeviceById').mockResolvedValue(null);
      
  //     await expect(controller.deleteDevice('999')).rejects.toThrow(
  //       new NotFoundException('Device with ID 999 not found')
  //     );
      
  //     expect(service.deleteDvice).not.toHaveBeenCalled();
  //   });

  //   it('should throw HttpException if service fails', async () => {
  //     jest.spyOn(service, 'getDeviceById').mockResolvedValue(mockDevice);
  //     jest.spyOn(service, 'deleteDvice').mockRejectedValue(new Error('Database error'));
      
  //     await expect(controller.deleteDevice('1')).rejects.toThrow(
  //       new HttpException('Failed to delete device', HttpStatus.INTERNAL_SERVER_ERROR)
  //     );
  //   });
  // });

  // describe('getDevicesByUserId', () => {
  //   it('should return devices by user id', async () => {
  //     jest.spyOn(service, 'getDeviceByUserId').mockResolvedValue(mockDevices);
      
  //     const result = await controller.getDevicesByUserId('1');
      
  //     expect(service.getDeviceByUserId).toHaveBeenCalledWith(1);
  //     expect(result).toEqual(mockDevices);
  //   });

  //   it('should throw HttpException if service fails', async () => {
  //     jest.spyOn(service, 'getDeviceByUserId').mockRejectedValue(new Error('Database error'));
      
  //     await expect(controller.getDevicesByUserId('1')).rejects.toThrow(
  //       new HttpException('Failed to fetch devices by user ID', HttpStatus.INTERNAL_SERVER_ERROR)
  //     );
  //   });
  // });

  // describe('getDevicesByTypeId', () => {
  //   it('should return devices by type id', async () => {
  //     jest.spyOn(service, 'getDeviceByTypeId').mockResolvedValue(mockDevices);
      
  //     const result = await controller.getDevicesByTypeId('1');
      
  //     expect(service.getDeviceByTypeId).toHaveBeenCalledWith(1);
  //     expect(result).toEqual(mockDevices);
  //   });

  //   it('should throw HttpException if service fails', async () => {
  //     jest.spyOn(service, 'getDeviceByTypeId').mockRejectedValue(new Error('Database error'));
      
  //     await expect(controller.getDevicesByTypeId('1')).rejects.toThrow(
  //       new HttpException('Failed to fetch devices by type ID', HttpStatus.INTERNAL_SERVER_ERROR)
  //     );
  //   });
  // });

  // describe('getStateTypes', () => {
  //   it('should return all state types', async () => {
  //     jest.spyOn(service, 'getStateTypes').mockResolvedValue(mockStateTypes);
      
  //     const result = await controller.getStateTypes();
      
  //     expect(service.getStateTypes).toHaveBeenCalled();
  //     expect(result).toEqual(mockStateTypes);
  //   });

  //   it('should throw HttpException if service fails', async () => {
  //     jest.spyOn(service, 'getStateTypes').mockRejectedValue(new Error('Database error'));
      
  //     await expect(controller.getStateTypes()).rejects.toThrow(
  //       new HttpException('Failed to fetch state types', HttpStatus.INTERNAL_SERVER_ERROR)
  //     );
  //   });
  // });
});