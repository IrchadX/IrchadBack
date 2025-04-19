import { Controller, Get, Param, Post } from '@nestjs/common';

// it means all the http endpoints start with /devices

@Controller('devices')
export class DevicesController {
  @Get()
  AllDevices() {
    return 'All devices';
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
