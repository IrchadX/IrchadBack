// src/environments/environments.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Get,
  Delete,
} from '@nestjs/common';
import { EnvironmentsService } from './environments.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';

@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get()
  async findAll() {
    return this.environmentsService.getAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.environmentsService.getOne(id);
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

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.environmentsService.delete(id);
  }
}
