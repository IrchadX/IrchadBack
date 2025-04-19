import { Controller, Get, Param, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
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
