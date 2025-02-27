import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from './prisma/prisma.service'; // Provide the correct path to the PrismaService file

@Module({
  providers: [UsersService, PrismaService], // Add PrismaService here
  controllers: [UsersController],
})
export class UsersModule {}
