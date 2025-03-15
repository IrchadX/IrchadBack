/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from './users.module';
import { PrismaService } from '../prisma/prisma.service';
import * as dotenv from 'dotenv';

describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: number;

  beforeAll(async () => {
    dotenv.config();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    // Nettoyage des données créées pour éviter les conflits dans d'autres tests
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await prisma.$disconnect();
    await app.close();
  });

  it('Should create a user (POST /users)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ 
        email: `test${Date.now()}@example.com`, 
        password: 'password123', 
        family_name: 'Benkhelifa',
        first_name: 'Bouchra',
        phone_number: '0612345678',
        birth_date: '2003-10-04', 
        sex: 'F',
        city: 'Mila',
        street: 'Rue Didouche Mourad',
        userTypeId: 1
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toContain('@example.com');

    userId = response.body.id; 
  });

  it('Should get all users (GET /users)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('Should get one user by ID (GET /users/:id)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', userId);
  });

  it('Should update a user (PATCH /users/:id)', async () => {
    await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .send({ firstName: 'Samira' })  // Correction du nom de champ
      .expect(200);
  
    const updatedUser = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200);
    
    expect(updatedUser.body.first_name).toBe('Samira');  
  });

  it('Should delete a user (DELETE /users/:id)', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(200);

    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    expect(foundUser).toBeNull();
  });
});

/*
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
describe('UsersService', () => {
  let service: UsersService;
  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const createUserDto = {
      firstName: 'Hind',
      familyName: 'Dehili',
      email: 'Hind@example.com',
      phoneNumber: '1234567890',
      password: 'password123',
      userTypeId: 1,
      birthDate: '1994-05-20',
      sex: 'F',
      city: 'City',
      street: 'Street',
    };
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = {
      id: 1,
      first_name: 'Hind',
      family_name: 'Dehili',
      email: 'Hind@example.com',
      phone_number: '1234567890',
      password: hashedPassword,
      userTypeId: 1,
      birth_date: new Date('1994-05-20'),
      sex: 'F',
      city: 'City',
      street: 'Street',
    };

    mockPrismaService.user.create.mockResolvedValue(createdUser);

    const result = await service.create(createUserDto);

    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        first_name: createUserDto.firstName,
        family_name: createUserDto.familyName,
        email: createUserDto.email,
      }),
    });
    expect(result).toEqual({
      id: 1,
      first_name: 'Hind',
      family_name: 'Dehili',
      email: 'Hind@example.com',
      phone_number: '1234567890',
      userTypeId: 1,
      birthDate: '1994-05-20',
      sex: 'F',
      city: 'City',
      street: 'Street',
    });
  });

  it('should fetch all users', async () => {
    const users = [
      {
        id: 1,
        first_name: 'Hind',
        family_name: 'Dehili',
        email: 'Hind@example.com',
        birth_date: new Date('1994-05-20'),
      },
      {
        id: 2,
        first_name: 'Zineb',
        family_name: 'Dehili',
        email: 'Zineb@example.com',
        birth_date: new Date('2000-10-15'),
      },
    ];
    mockPrismaService.user.findMany.mockResolvedValue(users);
    const result = await service.findAll();
    expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    expect(result).toEqual(
      expect.arrayContaining(
        users.map((user) =>
          expect.objectContaining({
            id: user.id,
            first_name: user.first_name,
            family_name: user.family_name,
            email: user.email,
            birthDate: user.birth_date.toISOString().split('T')[0], // Ensure correct formatting
          }),
        ),
      ),
    );
  });

  it('should update an existing user', async () => {
    const updateUserDto = { firstName: 'Hindd', familyName:'Dehilii' };
    const existingUser = {
      id: 1,
      first_name: 'Hind',
      family_name: 'Dehili',
      email: 'Hind@example.com',
      birth_date: new Date('1994-05-20'),
    };
    const updatedUser = {
      ...existingUser,
      first_name: updateUserDto.firstName,
      family_name: updateUserDto.familyName,
    };

    mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
    mockPrismaService.user.update.mockResolvedValue(updatedUser);
    const result = await service.update(1, updateUserDto);
    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        first_name: updateUserDto.firstName,
        family_name: updatedUser.family_name,
      }),
    });
    expect(result.id).toEqual(updatedUser.id);
    expect(result.first_name).toEqual(updatedUser.first_name);
    expect(result.family_name).toEqual(updatedUser.family_name);
    expect(result.email).toEqual(updatedUser.email);
  });

  it('should delete a user', async () => {
    const userToDelete = {
      id: 1,
      first_name: 'Hind',
      family_name: 'Dehili',
      birth_date: new Date('1994-05-20'),
    };
    mockPrismaService.user.findUnique.mockResolvedValue(userToDelete);
    mockPrismaService.user.delete.mockResolvedValue(userToDelete);
    const result = await service.remove(1);

    expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual({ message: 'User with ID 1 successfully deleted' });
  });

  it('should return a user by ID', async () => {
    const user = {
      id: 1,
      first_name: 'Hind',
      family_name: 'Dehili',
      email: 'Hind@example.com',
      birth_date: new Date('1994-05-20'),
    };
    mockPrismaService.user.findUnique.mockResolvedValue(user);
    const result = await service.findOne(1);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result.id).toEqual(user.id);
    expect(result.first_name).toEqual(user.first_name);
    expect(result.family_name).toEqual(user.family_name);
    expect(result.email).toEqual(user.email);
    expect(result.birthDate).toEqual(
      user.birth_date.toISOString().split('T')[0],
    );
  });
});
*/