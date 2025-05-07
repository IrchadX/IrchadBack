import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePoiDto } from './dto/create-poi.dto';
import { UpdatePoiDto } from './dto/update-poi.dto';

@Injectable()
export class PoisService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPoiDto: CreatePoiDto) {
    return this.prisma.poi.create({
      data: createPoiDto,
    });
  }

  async findAll() {
    return this.prisma.poi.findMany();
  }

  async findEnvironmentPois(id: string) {
    const intId = parseInt(id);
    return this.prisma.poi.findMany({
      where: {
        env_id: intId,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.poi.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatePoiDto: UpdatePoiDto) {
    console.log(updatePoiDto);
    return this.prisma.poi.update({
      where: { id },
      data: updatePoiDto,
    });
  }

  async remove(id: number) {
    await this.prisma.poi.delete({ where: { id } });
    return { message: `POI ${id} deleted` };
  }
}
