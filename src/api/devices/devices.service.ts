import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async getAllDevices() {
    return this.prisma.device.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            family_name: true,
          },
        },
        device_type: {
          select: {
            type: true,
          },
        },
      },
    });
  }
}
