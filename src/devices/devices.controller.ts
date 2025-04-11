import { Controller, Get, Param, Post } from '@nestjs/common';
import { DevicesService } from './devices.service';


@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  
  @Get()
  async getAllDevices() {
    return this.devicesService.getAllDevices();
  }

  @Post()
  addDevice() {
    return 'Create a device';
  }

  @Get(':id')
  getDevice(@Param('id') id: string) {
    return `This is device ${id}`;
  }
}
