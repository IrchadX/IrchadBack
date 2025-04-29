import { Module } from '@nestjs/common';
import { EnvironmentsService } from './environments.service';
import { EnvironmentsController } from './environments.controller';
import { PrismaService } from 'src/prisma/prisma.service';
@Module({
  controllers: [EnvironmentsController],
  providers: [EnvironmentsService, PrismaService],
})
export class EnvironmentsModule {}
