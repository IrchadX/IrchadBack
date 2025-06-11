import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateProfileDto } from './dto/Profile.dto';

@Injectable()
export class ProfilService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const data = {
      ...(updateProfileDto.firstName !== undefined && {
        first_name: updateProfileDto.firstName,
      }),
      ...(updateProfileDto.familyName !== undefined && {
        family_name: updateProfileDto.familyName,
      }),
      ...(updateProfileDto.email !== undefined && {
        email: updateProfileDto.email,
      }),
      ...(updateProfileDto.phoneNumber !== undefined && {
        phone_number: updateProfileDto.phoneNumber,
      }),
    };

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    // Type-safe way to exclude password without needing the user type
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
