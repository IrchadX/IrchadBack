/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/CreateDevice.dto';
import { UpdateDeviceDto} from './dto/UpdateDevice.dto';
@Injectable() 
export class DeviceService {
  constructor(private prisma: PrismaService) {}
  async getDevices(): Promise<CreateDeviceDto[]> {
  const devices = await this.prisma.device.findMany();
  
    const mappedDevices = devices.map(device => {
      return {
        type_id: device.type_id,
        software_version: device.software_version ,
        date_of_service: device.date_of_service.toISOString(), 
        state_type_id: device.state_type_id,
        mac_address: device.mac_address,
        user_id: device.user_id,
        comm_state: device.comm_state,
        battery_capacity: device.battery_capacity,
      };
    });
  
    return mappedDevices;
  } 
  async getDeviceById(id: number) {
    return this.prisma.device.findUnique({
    where: { 
            id: id,  
        },
    }); 
    } 
    async createDevice(data: CreateDeviceDto) {
        return this.prisma.device.create({
            data        });
    }
 
    async updateDevice(id: number, data: UpdateDeviceDto) {
        return this.prisma.device.update({
            where: {
                id: id,
            },
            data        });
    }
async setUser(id: number, user_id: number) {
  return this.prisma.device.update({
    where : {id:id},
    data: {user_id: user_id}
  })
}
  
    async deleteDvice(id: number) {
      return this.prisma.device.delete({
        where: { id:id},
      });
    }

    async getDeviceByUserId(id: number) {
      return this.prisma.device.findMany({
        where: {
          user_id: id,
        },
      });
    }
    async getDeviceByTypeId(id:number) {
      return this.prisma.device.findMany({
        where: {
          type_id: id,
        },
      });
    }
    async getDeviceByStateId(id:number) {
      return this.prisma.device.findMany({
        where: {
          state_type_id: id,
        },
      });
    }
    async getDeviceTypes()
    {
      return this.prisma.device_type.findMany({
       
      });
    }
    async getStateTypes()
    {
      return this.prisma.state_type.findMany({
        
      });
    }
    async getUsersWithNoDevices() {
      const users = await this.prisma.user.findMany({
        where: {
          userTypeId: 7,
          device: {
            none: {} 
          }
        },
        include: {
          userType: true 
        }
      });
      
      return users;
    }
}