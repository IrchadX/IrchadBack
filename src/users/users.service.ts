/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          first_name: createUserDto.firstName,
          family_name: createUserDto.familyName,
          phone_number: createUserDto.phoneNumber,
          password: hashedPassword,
          ...(createUserDto.userTypeId && {
            userTypeId: BigInt(createUserDto.userTypeId),
          }),
        },
      });

      const { password, ...resultWithBigInt } = user;

      const result = {
        ...resultWithBigInt,
        id: Number(resultWithBigInt.id),
        userTypeId: resultWithBigInt.userTypeId
          ? Number(resultWithBigInt.userTypeId)
          : null,
      };

      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException(
        'Failed to create user: ' + error.message,
      );
    }
  }
}
