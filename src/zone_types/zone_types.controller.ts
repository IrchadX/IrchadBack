import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ZoneTypesService } from './zone_types.service';
import { CreateZoneTypeDto } from './dto/create-zone_type.dto';
import { UpdateZoneTypeDto } from './dto/update-zone_type.dto';
import { JwtAuthGuard } from '@/api/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/api/auth/guards/roles.guard';
import { Roles } from '@/api/auth/decorators/roles.decorator';

// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin', 'super_admin')
@Controller('zone-types')
export class ZoneTypesController {
  constructor(private readonly zoneTypesService: ZoneTypesService) {}

  @Post()
  async create(@Body() createZoneTypeDto: CreateZoneTypeDto) {
    console.log('Incoming DTO:', createZoneTypeDto); // Debug log
    return this.zoneTypesService.create(createZoneTypeDto);
  }

  @Get()
  async findAll() {
    return this.zoneTypesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.zoneTypesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateZoneTypeDto: UpdateZoneTypeDto,
  ) {
    return this.zoneTypesService.update(+id, updateZoneTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zoneTypesService.remove(+id);
  }
}
