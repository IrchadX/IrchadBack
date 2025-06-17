/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeviceDto } from './dto/CreateDevice.dto';
import { UpdateDeviceDto } from './dto/UpdateDevice.dto';
@Injectable()
export class DeviceService {
  constructor(private prisma: PrismaService) {}
  async getDevices(): Promise<CreateDeviceDto[]> {
    const devices = await this.prisma.device.findMany();

    const mappedDevices = devices.map((device) => {
      return {
        type_id: device.type_id,
        software_version: device.software_version,
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
      data,
    });
  }

  async updateDevice(id: number, data: UpdateDeviceDto) {
    const updateData: any = { ...data };
    if (updateData.state_type_id !== undefined) {
      updateData.state_type = {
        connect: { id: updateData.state_type_id },
      };
      delete updateData.state_type_id;
    }
    if (updateData.user_id !== undefined) {
      updateData.user = {
        connect: { id: updateData.user_id },
      };
      delete updateData.user_id;
    }
    if (updateData.type_id !== undefined) {
      updateData.device_type = {
        connect: { id: updateData.type_id },
      };
      delete updateData.type_id;
    }

    return this.prisma.device.update({
      where: { id },
      data: updateData,
    });
  }

  async setUser(id: number, user_id: number) {
    return this.prisma.device.update({
      where: { id: id },
      data: { user_id: user_id },
    });
  }

  async deleteDvice(id: number) {
    return this.prisma.device.delete({
      where: { id: id },
    });
  }

  async getDeviceByUserId(id: number) {
    return this.prisma.device.findMany({
      where: {
        user_id: id,
      },
    });
  }
  async getDeviceByTypeId(id: number) {
    return this.prisma.device.findMany({
      where: {
        type_id: id,
      },
    });
  }
  async getDeviceByStateId(id: number) {
    return this.prisma.device.findMany({
      where: {
        state_type_id: id,
      },
    });
  }
  async getDeviceTypes() {
    return this.prisma.device_type.findMany({});
  }
  async getStateTypes() {
    return this.prisma.state_type.findMany({});
  }
  async getTypeById(id: number) {
    return this.prisma.device_type.findUnique({
      where: {
        id: id,
      },
    });
  }
  async getStateTypeById(id: number) {
    return this.prisma.state_type.findUnique({
      where: {
        id: id,
      },
    });
  }
  async getUsersWithNoDevices() {
    const users = await this.prisma.user.findMany({
      where: {
        userTypeId: 14,
        device: {
          none: {},
        },
      },
    });

    return users;
  }

  async getDevicesNotAssigned() {
    const devices = await this.prisma.device.findMany({
      where: {
        user_id: null,
      },
    });
    return devices;
  }

  async getDevicesNotAssigned2() {
    const devices = await this.prisma.device.findMany({
      where: {
        user_id: null,
      },
      select: {
        id: true,
        mac_address: true,
        software_version: true,
        date_of_service: true,
        comm_state: true,
        battery_capacity: true,
        price: true,
        device_type: {
          select: {
            type: true, // Include the type name
          },
        },
      },
    });
    return devices;
  }
  async getDevicesAssigned() {
    const devices = await this.prisma.device.findMany({
      where: {
        user_id: {
          not: null,
        },
      },
    });
    return devices;
  }
  async getUserByDeviceId(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    return user;
  }
  async toggleCommunicationState(id: number) {
    const device = await this.prisma.device.findUnique({
      where: { id: id },
      select: { comm_state: true },
    });

    return this.prisma.device.update({
      where: { id: id },
      data: { comm_state: !device?.comm_state },
    });
  }
}
