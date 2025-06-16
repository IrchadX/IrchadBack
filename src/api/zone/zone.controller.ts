import { Controller, Get } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
/*
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('decideur')*/
@Controller('zone')
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) {}

  @Get('centers')
  async getAllCenters() {
    return this.zoneService.getAllPolygonCenters();
  }
}
