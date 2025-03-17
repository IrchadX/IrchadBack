/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Get, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateDeviceDto } from './dto/CreateDevice.dto';
import { FORBIDDEN_MESSAGE } from '@nestjs/core/guards';

// it means all the http endpoints start with /devices

@Controller('devices')
export class DevicesController {
  @Get()
  AllDevices() {
    return 'All devices';
  }

  @Post()
  @UsePipes(new ValidationPipe({forbidNonWhitelisted: true}))
  // 
  addDevice(@Body() body:CreateDeviceDto) {
return body;
  }

  @Get(':id')
  getDevice(@Param('id') id: string) {
    return `This is device ${id}`;
  }
  @Patch(':id')
  updateDevice( @Param('id') id:number , @Body(new ValidationPipe({forbidNonWhitelisted: true})) body: CreateDeviceDto) {
   return `This is device ${id} updated`;
 }
}
