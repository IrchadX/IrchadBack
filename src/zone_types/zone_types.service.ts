import { Injectable } from '@nestjs/common';
import { CreateZoneTypeDto } from './dto/create-zone_type.dto';
import { UpdateZoneTypeDto } from './dto/update-zone_type.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ZoneTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createZoneTypeDto: CreateZoneTypeDto) {
    return this.prisma.zone_type.create({
      data: {
        type: createZoneTypeDto.type,
        color: createZoneTypeDto.color,
        icon: createZoneTypeDto.icon,
      },
    });
  }

  async findAll() {
    return this.prisma.zone_type.findMany();
  }

  async findOne(id: number) {
    return this.prisma.zone_type.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateZoneTypeDto: UpdateZoneTypeDto) {
    return this.prisma.zone_type.update({
      where: { id },
      data: {
        type: updateZoneTypeDto.type,
        color: updateZoneTypeDto.color,
        icon: updateZoneTypeDto.icon,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.zone_type.delete({
      where: { id },
    });
  }
}
