/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
      include: {
        user_type: true,
      },
    });

    console.log(loginDto);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = loginDto.password === user.password;
    console.log(user.userTypeId);
    // Compare passwords
    // const isPasswordValid = await bcrypt.compare(
    //   loginDto.password,
    //   user.password,
    // );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const userTypeName =
      user?.userTypeId != null
        ? this.prisma.user_type.findUnique({
            where: { id: user.userTypeId },
          })
        : undefined;

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: userTypeName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.first_name,
        familyName: user.family_name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: userTypeName,
      },
    };
  }
}
