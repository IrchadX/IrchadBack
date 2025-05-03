import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ZoneTypesService } from './zone-types.service';
import { CreateZoneTypeDto } from './dto/create-zone-type.dto';
import { UpdateZoneTypeDto } from './dto/update-zone-type.dto';

@Controller('zone-types')
export class ZoneTypesController {
  constructor(private readonly zoneTypesService: ZoneTypesService) {}

  @Post()
  create(@Body() createZoneTypeDto: CreateZoneTypeDto) {
    return this.zoneTypesService.create(createZoneTypeDto);
  }

  @Get()
  findAll() {
    return this.zoneTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zoneTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZoneTypeDto: UpdateZoneTypeDto) {
    return this.zoneTypesService.update(+id, updateZoneTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zoneTypesService.remove(+id);
  }
}
