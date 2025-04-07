// src/environments/environments.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Get,
  Delete,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { EnvironmentsService } from './environments.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { FiltersDto } from './dto/filter.dto';

@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get()
  async findAll(
    @Query('search') search: string,
    @Query('visibility') visibility: string[],
  ) {
    const filters = {
      visibility: visibility ?? [],
    };

    return this.environmentsService.getAll(filters, search ?? '');
  }

  @Post()
  create(@Body() createEnvironmentDto: CreateEnvironmentDto) {
    return this.environmentsService.create(createEnvironmentDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnvironmentDto: UpdateEnvironmentDto,
  ) {
    return this.environmentsService.update(id, updateEnvironmentDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.environmentsService.getOne(id);
    if (!result) {
      throw new NotFoundException(`Environment with ID ${id} not found`);
    }
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.environmentsService.delete(id);
    if (!result) {
      throw new NotFoundException(`Environment with ID ${id} not found`);
    }
    return result;
  }
}
