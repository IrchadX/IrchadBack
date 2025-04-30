/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Delete,
  Patch,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
  NotFoundException,
  Get,
  Post,
  Controller,
  Param,
} from '@nestjs/common';
import { CreateDeviceDto } from './dto/CreateDevice.dto';
import { UpdateDeviceDto } from './dto/UpdateDevice.dto';
import { DeviceService } from './device.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('commercial', 'admin', 'super_admin')
@Controller('devices')
export class DevicesController {
  constructor(private service: DeviceService) {}

   @Get() 
    async getAllDevices() { 
      try {
        return await this.service.getDevices(); 
      } catch (error) {
        console.error("Error fetching devices:", error);
        throw new HttpException('Failed to fetch devices', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } 
   
    @Post() 
    @UsePipes(new ValidationPipe({forbidNonWhitelisted: true})) 
    async createDevice(@Body() body: CreateDeviceDto) { 
      try {
        return await this.service.createDevice(body); 
      } catch (error) {
        console.error("Error creating device:", error);
        throw new HttpException('Failed to create device', HttpStatus.BAD_REQUEST);
      }
    } 
    @Get('types/')
    async getDeviceTypes()
    {
  
      try {
        const types = await this.service.getDeviceTypes();
        console.log("types")
        console.log(types) 
        return types;
      } catch (error) {
        console.log("function calld")
        console.log(error);
        throw new HttpException('Failed to fetch device types', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Get('users/all')
    async UsersWithNoDevicd() {
      try {
        const users = await this.service.getUsersWithNoDevices();
        console.log("users")
        console.log(users)
        return users;
      } catch (error) {
        throw new HttpException('Failed to fetch state types', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
   
    @Get('users/:id') 
    async getUserByDeviceId(@Param('id') id: string) { 
     try
     {
        const user = await this.service.getUserByDeviceId(Number(id));
        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
      }
      catch (error) {
     }
    } 
  
  
    @Get('notAssigned/')
    async getDevicesNotAssigned() {
      try {
        const stateTypes = await this.service.getDevicesNotAssigned();
        return stateTypes;
      } catch (error) {
        throw new HttpException('Failed to fetch unassigned devices', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Get('notAssigned2/')
    async getDevicesNotAssigned2() {
      try {
        const stateTypes = await this.service.getDevicesNotAssigned2();
        return stateTypes;
      } catch (error) {
        throw new HttpException('Failed to fetch unassigned devices', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Get('assigned/')
    async getDevicesAssigned() {
      try {
        const stateTypes = await this.service.getDevicesAssigned();
        return stateTypes;
      } catch (error) {
        throw new HttpException('Failed to fetch assigned devices', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    @Get(':id') 
    async getDeviceById(@Param('id') id: string) { 
      try {
        const device = await this.service.getDeviceById(Number(id));
        if (!device) {
          throw new NotFoundException(`Device with ID ${id} not found`);
        }
        return device;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new HttpException('Failed to fetch device77777777777', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } 
    
    @Patch(':id') 
    async updateDevice(@Param('id') id: string, @Body(new ValidationPipe({forbidNonWhitelisted: true})) body: UpdateDeviceDto) { 
      try {
        console.log('from th backend *****************************************')
        console.log(body)
        const deviceExists = await this.service.getDeviceById(Number(id));
  
        if (!deviceExists) {
          throw new NotFoundException(`Device with ID ${id} not found`);
        }
        return await this.service.updateDevice(Number(id), body);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        console.log(error);
        throw new HttpException('Failed to update device', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
    
    @Delete(':id')
    async deleteDevice(@Param('id') id: string) {
      try {
        const deviceExists = await this.service.getDeviceById(Number(id));
        if (!deviceExists) {
          throw new NotFoundException(`Device with ID ${id} not found`);
        }
        return await this.service.deleteDvice(Number(id));
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        console.log(error);
        throw new HttpException('Failed to delete device', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
    @Get('user/:id')
    async getDevicesByUserId(@Param('id') id: string) {
      try {
        const devices = await this.service.getDeviceByUserId(Number(id));
        return devices;
      } catch (error) {
        throw new HttpException('Failed to fetch devices by user ID', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
  
    @Get('device_type/:id')
    async getTypeById(@Param('id') id: string) {
      try {
        const type = await this.service.getTypeById(Number(id));
        return type;
      } catch (error) {
        throw new HttpException('Failed to fetch devices by type ID', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Get('type/:id')
    async getDevicesByTypeId(@Param('id') id: string) {
      try {
        const devices = await this.service.getDeviceByTypeId(Number(id));
        return devices;
      } catch (error) {
        throw new HttpException('Failed to fetch devices by type ID', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    @Get('state/:id')
    async getStateTypeById(@Param('id') id: string) {
      try {
        const state = await this.service.getStateTypeById(Number(id));
        return state;
      } catch (error) {
        console.error("Error fetching state type:", error);
        throw new HttpException('Failed to fetch state type by state ID', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    @Get('stateTypes/all')
    async getStateTypes() {
      try {
        const stateTypes = await this.service.getStateTypes();
        return stateTypes;
      } catch (error) {
        throw new HttpException('Failed to fetch state types', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
  @Patch('block_communication/:id')
  async blockCommunication(@Param('id') id: string) {
    try {
      const blocked = await this.service.toggleCommunicationState(Number(id));
    }
   catch (error) {
   console.error("Error blocking communication:", error);
  }
  }
}