import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PoiCategoriesService } from './poi-categories.service';
import { CreatePoiCategoryDto } from './dto/create-poi-category.dto';
import { UpdatePoiCategoryDto } from './dto/update-poi-category.dto';

@Controller('poi-categories')
export class PoiCategoriesController {
  constructor(private readonly poiCategoriesService: PoiCategoriesService) {}

  @Post()
  create(@Body() createPoiCategoryDto: CreatePoiCategoryDto) {
    return this.poiCategoriesService.create(createPoiCategoryDto);
  }

  @Get()
  findAll() {
    return this.poiCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.poiCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePoiCategoryDto: UpdatePoiCategoryDto,
  ) {
    return this.poiCategoriesService.update(+id, updatePoiCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.poiCategoriesService.remove(+id);
  }
}
