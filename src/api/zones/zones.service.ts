import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { color } from 'd3-color';
@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createZoneDto: CreateZoneDto) {
    return this.prisma.zone.create({
      data: {
        name: createZoneDto.name,
        description: createZoneDto.description,
        coordinates: createZoneDto.coordinates,
        type_id: createZoneDto.type_id,
      },
    });
  }

  async findEnvironmentZones(id: string) {
    const intId = parseInt(id);
    return this.prisma.zone.findMany({
      where: {
        env_id: intId,
      },
      include: {
        zone_type_zone_type_idTozone_type: {
          select: {
            type: true,
            color: true,
            name: true,
            icon: true,
            description: true,
            priority: true,
            accessible: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.zone.findMany({
      include: {
        zone_type_zone_zone_typeTozone_type: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.zone.findUnique({
      where: { id },
      include: {
        zone_type_zone_zone_typeTozone_type: {
          select: {
            type: true,
            color: true,
            name: true,
            icon: true,
            description: true,
            priority: true,
            accessible: true,
          },
        },
      },
    });
  }

  async update(id: number, updateZoneDto: UpdateZoneDto) {
    return this.prisma.zone.update({
      where: { id },
      data: {
        name: updateZoneDto.name,
        description: updateZoneDto.description,
        coordinates: updateZoneDto.coordinates,
      },
    });
  }

  async remove(id: number) {
    await this.prisma.zone.delete({
      where: { id },
    });
    return { message: `Zone ${id} deleted` };
  }
}