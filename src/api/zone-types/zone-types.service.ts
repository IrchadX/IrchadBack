import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZoneTypeDto } from './dto/create-zone-type.dto';
import { UpdateZoneTypeDto } from './dto/update-zone-type.dto';

@Injectable()
export class ZoneTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(CreateZoneTypeDto: CreateZoneTypeDto) {
    return this.prisma.zone_type.create({
      data: CreateZoneTypeDto,
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

  async update(id: number, UpdateZoneTypeDto: UpdateZoneTypeDto) {
    console.log(UpdateZoneTypeDto);
    return this.prisma.zone_type.update({
      where: { id },
      data: UpdateZoneTypeDto,
    });
  }

  async remove(id: number) {
    await this.prisma.zone_type.delete({ where: { id } });
  }
}
