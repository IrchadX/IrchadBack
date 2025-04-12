/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updatePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Verify the current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new InternalServerErrorException('Current password is incorrect');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password
      await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error updating password:', error);
      throw new InternalServerErrorException(
        'Failed to update password: ' + error.message,
      );
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          first_name: createUserDto.firstName,
          family_name: createUserDto.familyName,
          email: createUserDto.email,
          phone_number: createUserDto.phoneNumber,
          password: hashedPassword,
          userTypeId: createUserDto.userTypeId ?? null,
          birth_date: createUserDto.birthDate
            ? new Date(createUserDto.birthDate)
            : null,
          sex: createUserDto.sex ?? null,
          city: createUserDto.city ?? null,
          street: createUserDto.street ?? null,
        },
      });
      const { password, birth_date, ...result } = user;
      return {
        ...result,
        id: Number(result.id),
        userTypeId: result.userTypeId ? Number(result.userTypeId) : null,
        birthDate: birth_date ? birth_date.toISOString().split('T')[0] : null, // Formatting birth date
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException(
        'Failed to create user: ' + error.message,
      );
    }
  }

  async findAll(search?: string, filters?: any) {
    try {
      const whereClause: any = {};

      // Search by name
      if (search) {
        whereClause.OR = [
          { family_name: { contains: search, mode: 'insensitive' } },
          { first_name: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Filter by sex
      if (filters?.sex) {
        whereClause.sex = filters.sex;
      }

      // Filter by age groups
      if (filters?.ageGroup) {
        const today = new Date();
        const getDateYearsAgo = (years: number) =>
          new Date(
            today.getFullYear() - years,
            today.getMonth(),
            today.getDate(),
          );

        if (filters.ageGroup === 'under18') {
          whereClause.birth_date = { gte: getDateYearsAgo(18) };
        } else if (filters.ageGroup === '18-30') {
          whereClause.birth_date = {
            gte: getDateYearsAgo(30),
            lte: getDateYearsAgo(18),
          };
        } else if (filters.ageGroup === '31-50') {
          whereClause.birth_date = {
            gte: getDateYearsAgo(50),
            lte: getDateYearsAgo(31),
          };
        } else if (filters.ageGroup === 'over50') {
          whereClause.birth_date = { lte: getDateYearsAgo(50) };
        }
      }

      // Filter by city
      if (filters?.city) {
        whereClause.city = filters.city;
      }

      // Filter by user type
      if (filters?.userType) {
        const userTypes = await this.prisma.user_type.findMany();
        console.log(`All user types: ${JSON.stringify(userTypes)}`);

        // Fetch the userTypeId for the given type
        const userType = await this.prisma.user_type.findFirst({
          where: { type:{ in: filters.userType }  },
        });

        if (userType) {
          whereClause.userTypeId = userType.id; // Filter by userTypeId
        } else {
          return [];
        }
      }

      // Fetch users with filters
      const users = await this.prisma.user.findMany({
        where: whereClause,
        include: { userType: true },
      });

      return users.map(({ password, birth_date, userType, ...user }) => ({
        ...user,
        userType: userType ? userType.type : 'N/A',
        birthDate: birth_date ? birth_date.toISOString().split('T')[0] : null,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      console.log('Update Data:', updateUserDto);

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          first_name: updateUserDto.firstName ?? existingUser.first_name,
          family_name: updateUserDto.familyName ?? existingUser.family_name,
          email: updateUserDto.email ?? existingUser.email,
          phone_number: updateUserDto.phoneNumber ?? existingUser.phone_number,
          birth_date: updateUserDto.birthDate ?? existingUser.birth_date,
          sex: updateUserDto.sex ?? existingUser.sex,
          city: updateUserDto.city ?? existingUser.city,
          street: updateUserDto.street ?? existingUser.street,
          userTypeId: updateUserDto.userTypeId ?? existingUser.userTypeId,
        },
      });

      console.log('Updated User:', updatedUser);

      const { password, birth_date, ...result } = updatedUser;
      return {
        ...result,
        birthDate: birth_date ? birth_date.toISOString().split('T')[0] : null,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new InternalServerErrorException(
        'Failed to update user: ' + error.message,
      );
    }
  }

  async remove(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.prisma.user.delete({ where: { id } });

      return { message: `User with ID ${id} successfully deleted` };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new InternalServerErrorException(
        'Failed to delete user: ' + error.message,
      );
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          userType: true, // This acts like a JOIN to get the user type name
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Destructure and format response
      const { password, birth_date, userType, ...result } = user;

      return {
        ...result,
        userTypeName: userType?.type ?? null, // Get the actual name from the user_type table
        birthDate: birth_date ? birth_date.toISOString().split('T')[0] : null, // Convert birth_date to YYYY-MM-DD
      };
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }
}