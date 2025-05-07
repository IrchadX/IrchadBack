import { Controller, Get } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { Roles } from '../api/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../api/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../api/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
/*
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('decideur')*/
@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get('centers')
  async getAllCenters() {
    return this.zonesService.getAllPolygonCenters();
  }
}
