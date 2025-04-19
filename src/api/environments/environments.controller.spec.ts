import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentsController } from './environments.controller';
import { EnvironmentsService } from './environments.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';

describe('EnvironmentsController', () => {
  let controller: EnvironmentsController;
  let service: EnvironmentsService;

  beforeEach(async () => {
    const mockService = {
      getAll: jest.fn(),
      getOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnvironmentsController],
      providers: [
        {
          provide: EnvironmentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EnvironmentsController>(EnvironmentsController);
    service = module.get<EnvironmentsService>(EnvironmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all environments', async () => {
      const mockEnvironments = [{ id: 1, name: 'Test Env' }];
      (service.getAll as jest.Mock).mockResolvedValue(mockEnvironments);

      const result = await controller.findAll();
      expect(result).toEqual(mockEnvironments);
      expect(service.getAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single environment', async () => {
      const mockEnvironment = {
        environment: { id: 1, name: 'Test Env' },
        zones: [],
        pois: [],
      };
      (service.getOne as jest.Mock).mockResolvedValue(mockEnvironment);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockEnvironment);
      expect(service.getOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if environment not found', async () => {
      (service.getOne as jest.Mock).mockResolvedValue(null);
      await expect(controller.findOne('999')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new environment', async () => {
      const createDto: CreateEnvironmentDto = {
        type: 'FeatureCollection',
        features: [],
        properties: {
          environment: {
            isPublic: false,
            name: 'New Env',
            userId: 1,
            address: 'Test Address',
          },
        },
      };
      const mockResult = { id: 1, ...createDto };
      (service.create as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.create(createDto);
      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update an environment', async () => {
      const updateDto: UpdateEnvironmentDto = {
        type: 'FeatureCollection',
        features: [],
        properties: {
          environment: {
            name: 'Updated Env',
            userId: 1,
            address: 'Updated Address',
            isPublic: false,
          },
        },
      };
      const mockResult = { id: 1, ...updateDto };
      (service.update as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.update('1', updateDto);
      expect(result).toEqual(mockResult);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete an environment', async () => {
      const mockResult = {
        message: 'Environment 1 and its related data have been deleted.',
      };
      (service.delete as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.remove('1');
      expect(result).toEqual(mockResult);
      expect(service.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if environment not found', async () => {
      (service.delete as jest.Mock).mockResolvedValue(null);
      await expect(controller.remove('999')).rejects.toThrow();
    });
  });
});
