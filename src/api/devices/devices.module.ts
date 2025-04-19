import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';

// in every single time we add a new controller it is automatically added here

@Module({
  controllers: [DevicesController],
})
export class DevicesModule {}
