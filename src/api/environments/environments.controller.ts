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
  UseGuards,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { EnvironmentsService } from './environments.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { CreateBasicEnvironmentDto } from './dto/create-basic-environment.dto';
import { FiltersDto } from './dto/filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin', 'commercial')
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

  @Get('pending')
  async findPending(
    @Query('search') search: string,
    @Query('visibility') visibility: string[],
  ) {
    const filters = {
      visibility: visibility ?? [],
    };

    return this.environmentsService.getPending(filters, search ?? '');
  }

  @Post()
  create(@Body() createEnvironmentDto: CreateEnvironmentDto) {
    return this.environmentsService.create(createEnvironmentDto);
  }

  @Post('create-basic-environment')
  createBasicEnvironment(
    @Body() createBasicEnvironmentDto: CreateBasicEnvironmentDto,
  ) {
    return this.environmentsService.createBasicEnvironment(
      createBasicEnvironmentDto,
    );
  }
  @Put(':id/finalize')
  async finalize(@Param('id') id: string, @Body() updateEnvironmentDto: any) {
    console.log('Received data:', updateEnvironmentDto); // Debug log
    return this.environmentsService.finalize(+id, updateEnvironmentDto);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() updateEnvironmentDto: any) {
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
