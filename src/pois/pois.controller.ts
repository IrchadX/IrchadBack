import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PoisService } from './pois.service';
import { CreatePoisDto } from './dto/create-pois.dto';
import { UpdatePoisDto } from './dto/update-pois.dto';

@Controller('pois')
export class PoisController {
  constructor(private readonly poisService: PoisService) {}

  @Post()
  create(@Body() createPoisDto: CreatePoisDto) {
    return this.poisService.create(createPoisDto);
  }

  @Get()
  findAll() {
    return this.poisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.poisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePoisDto: UpdatePoisDto) {
    return this.poisService.update(+id, updatePoisDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.poisService.remove(+id);
  }
}
