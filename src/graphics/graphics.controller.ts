import { Controller, Get } from '@nestjs/common';
import {GraphicsService } from './graphics.service';

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
