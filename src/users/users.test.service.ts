import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = {
      user: {
        create: jest.fn().mockResolvedValue({
          id: '1',
          first_name: 'John',
          family_name: 'Doe',
          email: 'johndoe@example.com',
          phone_number: '1234567890',
          password: 'password123',
          userTypeId: null,
          birth_date: null,
          sex: null,
          city: null,
          street: null,
        }),
      },
    } as unknown as PrismaService;

    usersService = new UsersService(prismaService);
  });

  describe('create', () => {
    it('should create a new user with valid input data', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        familyName: 'Doe',
        email: 'johndoe@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      const result = await usersService.create(createUserDto);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          first_name: 'John',
          family_name: 'Doe',
          email: 'johndoe@example.com',
          phone_number: '1234567890',
          password: hashedPassword,
          userTypeId: null,
          birth_date: null,
          sex: null,
          city: null,
          street: null,
        },
      });

      expect(result).toEqual({
        id: 1,
        firstName: 'John',
        familyName: 'Doe',
        email: 'johndoe@example.com',
        phoneNumber: '1234567890',
        userTypeId: null,
        birthDate: null,
        sex: null,
        city: null,
        street: null,
      });
    });
  });
});