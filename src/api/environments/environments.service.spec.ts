import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { EnvironmentsService } from './environments.service';
import { POIZoneUtils } from '../utils/poi-zone.utils';
import { NotFoundException } from '@nestjs/common';

// Create interface for our mock Prisma service
interface MockPrismaService {
  map: {
    create: jest.Mock;
  };
  environment: {
    create: jest.Mock;
    update: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    delete: jest.Mock;
  };
  env_delimiter: {
    create: jest.Mock;
  };
  env_user: {
    create: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    deleteMany: jest.Mock;
  };
  zone: {
    createMany: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    deleteMany: jest.Mock;
  };
  poi: {
    createMany: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    deleteMany: jest.Mock;
  };
}

describe('EnvironmentsService', () => {
  let service: EnvironmentsService;
  let prisma: MockPrismaService;
  let poiZoneUtils: Partial<POIZoneUtils>;

  beforeEach(async () => {
    const mockPrisma: MockPrismaService = {
      map: {
        create: jest.fn(),
      },
      environment: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      env_delimiter: {
        create: jest.fn(),
      },
      env_user: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      zone: {
        createMany: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      poi: {
        createMany: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvironmentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: POIZoneUtils,
          useValue: {
            detectPOIsInsideZones: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EnvironmentsService>(EnvironmentsService);
    prisma = module.get<typeof mockPrisma>(PrismaService);
    poiZoneUtils = module.get<POIZoneUtils>(POIZoneUtils);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('new environment with all related entities', async () => {
      const createDto = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { type: 'environment' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [1, 2],
                  [3, 4],
                  [5, 6],
                  [1, 2],
                ],
              ],
            },
          },
          {
            type: 'Feature',
            properties: {
              type: 'poi',
              name: 'POI 1',
              description: 'Desc 2',
              image: 'img.jpg',
              env_id: 1,
              map_id: 1,
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [7, 8],
                [9, 10],
              ],
            },
          },
          {
            type: 'Feature',
            properties: {
              type: 'zone',
              name: 'Zone 1',
              description: 'Desc 1',
              env_id: 1,
              map_id: 1,
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [1, 2],
                  [3, 4],
                  [5, 6],
                  [1, 2],
                ],
              ],
            },
          },
        ],
        properties: {
          environment: {
            name: 'Test Env',
            isPublic: true,
            userId: 1,
            address: 'Test Address',
          },
        },
      };

      const mockMap = { id: 1 };
      const mockEnvironment = { id: 1, user_id: 1, map_id: 1 };

      prisma.map.create.mockResolvedValue(mockMap);
      prisma.environment.create.mockResolvedValue(mockEnvironment);
      prisma.zone.createMany.mockResolvedValue({ count: 1 });
      prisma.poi.createMany.mockResolvedValue({ count: 1 });

      // Simulate dynamically retrieving inserted data
      const mockZones = [{ id: 10, name: 'Zone 1' }]; // Mock zone with a dynamic ID
      const mockPois = [{ id: 20, name: 'POI 1' }]; // Mock POI with a dynamic ID

      prisma.zone.findMany.mockResolvedValue(mockZones);
      prisma.poi.findMany.mockResolvedValue(mockPois);

      const result = await service.create(createDto);

      expect(result).toEqual({
        environment: mockEnvironment,
        zones: [
          {
            name: 'Zone 1',
            description: 'Desc 1',
            coordinates: [
              [
                [1, 2],
                [3, 4],
                [5, 6],
                [1, 2],
              ],
            ],
            env_id: 1,
            map_id: 1,
          },
        ],
        pois: [
          {
            name: 'POI 1',
            description: 'Desc 2',
            coordinates: [[7, 8], [9, 10], ,],
            image_url: 'img.jpg',
            env_id: 1,
            map_id: 1,
          },
        ],
      });
    });

    it('should create environment without delimiter when no environment feature exists', async () => {
      const createDto = {
        type: 'FeatureCollection',
        features: [
          // No environment feature
          {
            type: 'Feature',
            properties: { type: 'zone', name: 'Zone 1' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [1, 2],
                  [3, 4],
                  [5, 6],
                  [1, 2],
                ],
              ],
            },
          },
        ],
        properties: {
          environment: {
            name: 'Test Env',
            userId: 1,
            isPublic: true,
          },
        },
      };

      prisma.map.create.mockResolvedValue({ id: 1 });
      prisma.environment.create.mockResolvedValue({
        id: 1,
        user_id: 1,
        map_id: 1,
      });
      await service.create(createDto);
      expect(prisma.env_delimiter.create).not.toHaveBeenCalled();
    });

    it('should handle environment creation without user ID', async () => {
      const createDto = {
        type: 'FeatureCollection',
        features: [],
        properties: {
          environment: {
            isPublic: true,
            name: 'Public Env',
            address: 'Test Address',
          },
        },
      };

      prisma.map.create.mockResolvedValue({ id: 1 });
      prisma.environment.create.mockResolvedValue({
        id: 1,
        user_id: null,
        map_id: 1,
      });

      const result = await service.create(createDto);

      expect(prisma.env_user.create).not.toHaveBeenCalled();
      expect(result.environment.user_id).toBeNull();
    });

    it('should create environment with no zones or POIs', async () => {
      const createDto = {
        type: 'FeatureCollection',
        features: [],
        properties: {
          environment: {
            name: 'Empty Env',
            userId: 1,
            address: 'Test Address',
            isPublic: true,
          },
        },
      };

      prisma.map.create.mockResolvedValue({ id: 1 });
      prisma.environment.create.mockResolvedValue({
        id: 1,
        user_id: 1,
        map_id: 1,
      });

      const result = await service.create(createDto);

      expect(prisma.zone.createMany).not.toHaveBeenCalled();
      expect(prisma.poi.createMany).not.toHaveBeenCalled();
      expect(result.zones).toEqual([]);
      expect(result.pois).toEqual([]);
    });

    it('should accept valid FeatureCollection GeoJSON', async () => {
      const validDto = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { type: 'environment' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [1, 2],
                  [3, 4],
                  [5, 6],
                  [1, 2],
                ],
              ],
            },
          },
        ],
        properties: {
          environment: {
            name: 'Test Env',
            userId: 1,
            address: 'Test Address',
            isPublic: false,
          },
        },
      };

      prisma.map.create.mockResolvedValue({ id: 1 });
      prisma.environment.create.mockResolvedValue({
        id: 1,
        user_id: 1,
        map_id: 1,
      });

      await expect(service.create(validDto)).resolves.not.toThrow();
    });

    it('should reject non-FeatureCollection GeoJSON', async () => {
      const invalidDto = {
        type: 'Feature',
        features: [],
        properties: {
          environment: {
            name: 'Test Env',
            userId: 1,
            address: 'Test Address',
            isPublic: false,
          },
        },
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        'Invalid GeoJSON format: Must be a FeatureCollection',
      );
    });

    it('should reject invalid geometry types', async () => {
      const invalidDto = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { type: 'poi' },
            geometry: {
              type: 'InvalidType',
              coordinates: [1, 2],
            },
          },
        ],
        properties: {
          environment: {
            name: 'Test Env',
            userId: 1,
            address: 'Test Address',
            isPublic: false,
          },
        },
      };
      prisma.map.create.mockResolvedValue({ id: 1 });
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Unsupported geometry type',
      );
    });
  });
  describe('getAll', () => {
    it('should return all environments', async () => {
      const mockEnvironments = [{ id: 1, name: 'Env 1' }];
      prisma.environment.findMany.mockResolvedValue(mockEnvironments);

      const result = await service.getAll();
      expect(result).toEqual(mockEnvironments);
      expect(prisma.environment.findMany).toHaveBeenCalled();
    });
  });

  describe('getOne', () => {
    it('should return an environment with zones and pois', async () => {
      const mockEnvironment = {
        id: 1,
        name: 'Test Env',
        zone: [{ id: 1, name: 'Zone 1' }],
        pois: [{ id: 1, name: 'POI 1' }],
      };
      prisma.environment.findUnique.mockResolvedValue(mockEnvironment);

      const result = await service.getOne('1');
      expect(result.environment).toEqual(mockEnvironment);
      expect(result.zones).toEqual(mockEnvironment.zone);
      expect(result.pois).toEqual(mockEnvironment.pois);
    });

    it('should throw NotFoundException if environment not found', async () => {
      prisma.environment.findUnique.mockResolvedValue(null);
      await expect(service.getOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete environment and related data', async () => {
      prisma.environment.findUnique.mockResolvedValue({ id: 1 });

      const result = await service.delete('1');
      expect(prisma.zone.deleteMany).toHaveBeenCalledWith({
        where: { env_id: 1 },
      });
      expect(prisma.poi.deleteMany).toHaveBeenCalledWith({
        where: { env_id: 1 },
      });
      expect(prisma.environment.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result.message).toContain('deleted');
    });

    it('should throw NotFoundException if environment not found', async () => {
      prisma.environment.findUnique.mockResolvedValue(null);
      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            type: 'zone',
            id: 1,
            name: 'Updated Zone',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [0, 1],
                [1, 1],
                [0, 0],
              ],
            ],
          },
        },
      ],
      properties: {
        environment: {
          name: 'Updated Env',
          userId: 1,
          address: 'Updated Address',
          isPublic: false,
        },
      },
    };

    it('should update environment and related entities', async () => {
      const mockEnvironment = { id: 1, name: 'Updated Env' };
      prisma.environment.update.mockResolvedValue(mockEnvironment);
      prisma.env_user.findFirst.mockResolvedValue({
        id: 1,
        user_id: 1,
        env_id: 1,
      });
      prisma.zone.findMany.mockResolvedValue([{ id: 1, name: 'Old Zone' }]);
      prisma.poi.findMany.mockResolvedValue([]);

      const result = await service.update('1', updateDto);
      expect(result).toEqual(mockEnvironment);
      expect(prisma.zone.update).toHaveBeenCalled();
    });

    it('should handle public environment updates', async () => {
      const publicDto = { ...updateDto };
      prisma.zone.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Old Zone',
          coordinates: [
            [
              [0, 0],
              [0, 1],
              [1, 1],
              [0, 0],
            ],
          ],
          env_id: 1,
        },
      ]);

      prisma.poi.findMany.mockResolvedValue([]);
      publicDto.properties.environment.isPublic = true;

      prisma.environment.update.mockResolvedValue({ id: 1 });
      await service.update('1', publicDto);
      expect(prisma.env_user.deleteMany).toHaveBeenCalled();
    });

    it('should handle new user assignment', async () => {
      const testDto = {
        type: 'FeatureCollection',
        features: [],
        properties: {
          environment: {
            name: 'Test Env',
            userId: 1,
            address: 'Test Address',
            isPublic: false,
          },
        },
      };

      prisma.zone.findMany.mockResolvedValue([]);
      prisma.poi.findMany.mockResolvedValue([]);
      prisma.env_user.findFirst.mockResolvedValue(null);
      prisma.environment.update.mockResolvedValue({ id: 1 });

      prisma.env_user.create.mockResolvedValue({ id: 1 });

      await service.update('1', testDto);

      expect(prisma.env_user.create).toHaveBeenCalledWith({
        data: {
          env_id: 1,
          user_id: 1,
        },
      });
    });
  });

  describe('detectChanges', () => {
    it('should detect added, updated and deleted items', () => {
      const newItems = [
        { id: 1, name: 'Updated' },
        { id: 2, name: 'New' },
      ];
      const existingItems = [
        { id: 1, name: 'Old' },
        { id: 3, name: 'ToDelete' },
      ];

      const result = (service as any).detectChanges(newItems, existingItems);

      expect(result.added).toEqual([{ id: 2, name: 'New' }]);
      expect(result.updated).toEqual([{ id: 1, name: 'Updated' }]);
      expect(result.deletedIds).toEqual([3]);
    });
  });

  describe('validateGeometry', () => {
    it('should validate Point geometry', () => {
      const point = { type: 'Point', coordinates: [1, 2] };
      expect(() => (service as any).validateGeometry(point)).not.toThrow();
    });

    it('should throw for invalid Point', () => {
      const invalidPoint = { type: 'Point', coordinates: 'invalid' };
      expect(() => (service as any).validateGeometry(invalidPoint)).toThrow();
    });

    it('should validate Polygon geometry', () => {
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 1],
            [0, 0],
          ],
        ],
      };
      expect(() => (service as any).validateGeometry(polygon)).not.toThrow();
    });

    it('should throw for unclosed Polygon', () => {
      const unclosedPolygon = {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 1],
          ],
        ],
      };
      expect(() =>
        (service as any).validateGeometry(unclosedPolygon),
      ).toThrow();
    });
  });
});
