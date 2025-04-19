import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DeviceService } from './device.service';
import { PrismaModule } from '../prisma/prisma.module'; // Make sure this path is correct

// in every single time we add a new controller it is automatically added here

@Module({
  imports: [PrismaModule],
  controllers: [DevicesController],
  providers: [DeviceService],
})
export class DevicesModule {}
