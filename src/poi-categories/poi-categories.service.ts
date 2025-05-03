import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePoiCategoryDto } from './dto/create-poi-category.dto';
import { UpdatePoiCategoryDto } from './dto/update-poi-category.dto';

@Injectable()
export class PoisService {
  constructor(private readonly prisma: PrismaService) {}

  async create(CreatePoiCategoryDto: CreatePoiCategoryDto) {
    return this.prisma.poi_category.create({
      data: CreatePoiCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.poi_category.findMany();
  }

  async findOne(id: number) {
    return this.prisma.poi_category.findUnique({
      where: { id },
    });
  }

  async update(id: number, UpdatePoiCategoryDto: UpdatePoiCategoryDto) {
    console.log(UpdatePoiCategoryDto);
    return this.prisma.poi_category.update({
      where: { id },
      data: UpdatePoiCategoryDto,
    });
  }

  async remove(id: number) {
    await this.prisma.poi_category.delete({ where: { id } });
    return { message: `POI ${id} deleted` };
  }
}
