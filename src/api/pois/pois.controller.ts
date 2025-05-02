import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { PoisService } from './pois.service';
import { CreatePoiDto } from './dto/create-poi.dto';
import { UpdatePoiDto } from './dto/update-poi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@Controller('pois')
export class PoisController {
  constructor(private readonly poisService: PoisService) {}

  @Post()
  create(@Body() createPoiDto: CreatePoiDto) {
    return this.poisService.create(createPoiDto);
  }

  @Get('/env/:id')
  findEnvironmentZones(@Param('id') id: string) {
    return this.poisService.findEnvironmentPois(id);
  }

  @Get()
  findAll() {
    return this.poisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.poisService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePoiDto: UpdatePoiDto) {
    return this.poisService.update(Number(id), updatePoiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.poisService.remove(Number(id));
  }
}
