import { Controller, Get } from '@nestjs/common';
import { GraphicsService } from './graphics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('commercial', 'admin', 'super_admin', 'decideur')
@Controller('graphics')
export class GraphicsController {
  constructor(private readonly GraphicsService: GraphicsService) {}

  @Get('cercle')
  async getPannesByDeviceType() {
    return this.GraphicsService.getPannesByDeviceType();
  }
  @Get('courbe')
  getGlobalSalesByMonth() {
    return this.GraphicsService.getGlobalSalesByMonth();
  }
}
