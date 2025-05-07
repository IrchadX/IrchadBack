import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateProfileDto } from './dto/Profile.dto';
import { user } from '@prisma/client';

@Injectable()
export class ProfilService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Partial<user>> {
    const data: Partial<user> = {};

    if (updateProfileDto.firstName !== undefined) {
      data.first_name = updateProfileDto.firstName;
    }
    if (updateProfileDto.familyName !== undefined) {
      data.family_name = updateProfileDto.familyName;
    }
    if (updateProfileDto.email !== undefined) {
      data.email = updateProfileDto.email;
    }
    if (updateProfileDto.phoneNumber !== undefined) {
      data.phone_number = updateProfileDto.phoneNumber;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: data,
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
