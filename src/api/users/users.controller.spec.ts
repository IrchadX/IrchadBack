/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn().mockImplementation((dto: CreateUserDto) => ({
      id: 1,
      ...dto,
    })),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockImplementation((id: number) => ({
      id,
      name: 'Test User',
    })),
    update: jest.fn().mockImplementation((id: number, dto: UpdateUserDto) => ({
      id,
      ...dto,
    })),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct data', async () => {
    const dto: CreateUserDto = {
      familyName: 'John Doe',
      firstName: 'John',
      email: 'lh_dehili@esi.dz',
      password: '123456',
      phoneNumber: '0555555555',
    };
    await controller.create(dto);
    expect(usersService.create).toHaveBeenCalledWith(dto);
  });

  it('should return an array of users', async () => {
    await controller.getUsers();
    expect(usersService.findAll).toHaveBeenCalled();
  });

  it('should return a user by ID', async () => {
    const result = await controller.findOne(1);
    expect(usersService.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, name: 'Test User' });
  });

  it('should update a user', async () => {
    const dto: UpdateUserDto = {
      familyName: 'John Doe',
      firstName: 'John',
      email: 'lh_dehili@esi.dz',
      password: '123456',
      phoneNumber: '0555555555',
    };
    const result = await controller.update('1', dto);
    expect(usersService.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should delete a user', async () => {
    const result = await controller.remove(1);
    expect(usersService.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({ deleted: true });
  });
});
