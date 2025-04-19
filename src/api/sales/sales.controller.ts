import { Controller, UseGuards, Get, Post, Body, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('commercial')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // Endpoint to get all purchase history
  @Get('purchase-history')
  async getPurchaseHistory() {
    return this.salesService.getPurchaseHistory();
  }

  // Endpoint to add a new purchase
  @Post('add-purchase')
  async addPurchase(
    @Body('userId') userId: number,
    @Body('deviceId') deviceId: number,
  ) {
    return this.salesService.addPurchase(userId, deviceId);
  }

  // Endpoint to get sales statistics
  @Get('statistics')
  async getSalesStatistics() {
    return this.salesService.getSalesStatistics();
  }
}
