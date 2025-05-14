import { Controller, Get } from '@nestjs/common';

import { GraphicsService } from '@/api/graphics/graphics.service';

/*@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('decideur')*/
@Controller('graphics')
export class GraphicsController {
  constructor(private readonly graphicsService: GraphicsService) {}

  @Get('cercle')
  async getPannesByDeviceType() {
    return this.graphicsService.getPannesByDeviceType();
  }
  @Get('courbe')
  getGlobalSalesByMonth() {
    return this.graphicsService.getGlobalSalesByMonth();
  }
}
