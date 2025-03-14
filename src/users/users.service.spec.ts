/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
      age: 30,
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
      age: 30,
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
      age: 30,
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
      },
      {
        id: 2,
        first_name: 'Zineb',
        family_name: 'Dehili',
        email: 'Zineb@example.com',
      },
    ];
    mockPrismaService.user.findMany.mockResolvedValue(users);
    const result = await service.findAll();
    expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    expect(result).toEqual(
      expect.arrayContaining(
        users.map((user) => expect.objectContaining(user)),
      ),
    );
  });

  it('should update an existing user', async () => {
    const updateUserDto = { firstName: 'Hindd' };
    const existingUser = {
      id: 1,
      first_name: 'Hind',
      family_name: 'Dehili',
      email: 'Hind@example.com',
    };
    const updatedUser = {
      ...existingUser,
      first_name: updateUserDto.firstName, // Updated field
    };
    mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
    mockPrismaService.user.update.mockResolvedValue(updatedUser);
    const result = await service.update(1, updateUserDto);
    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        first_name: updateUserDto.firstName,
      }),
    });
    // Verify the result matches what we expect
    expect(result.id).toEqual(updatedUser.id);
    expect(result.first_name).toEqual(updatedUser.first_name);
    expect(result.family_name).toEqual(updatedUser.family_name);
    expect(result.email).toEqual(updatedUser.email);
  });
  it('should delete a user', async () => {
    const userToDelete = { id: 1, first_name: 'Hind', family_name: 'Dehili' };
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
  });
});
