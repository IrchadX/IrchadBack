import { Controller, Get, Query } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';

/*
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('decideur')
*/
@Controller('zone')
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) {}

  @Get('centers')
  async getAllCenters() {
    try {
      const centers = await this.zoneService.getAllPolygonCenters();
      return {
        success: true,
        count: centers.length,
        data: centers
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  @Get('debug')
  async debugPolygons(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 3;
      const debug = await this.zoneService.debugPolygons(limitNum);
      return {
        success: true,
        ...debug
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('raw')
  async getRawData(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 5;
      const rawData = await this.zoneService.getRawPolygons(limitNum);
      return {
        success: true,
        count: rawData.length,
        data: rawData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}