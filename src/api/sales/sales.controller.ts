import { Controller, UseGuards, Get, Post, Body, Query } from '@nestjs/common';
import { SalesService } from './sales.service';

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
    @Body('hasPublicAccess') hasPublicAccess: boolean,
  ) {
    return this.salesService.addPurchase(userId, deviceId, hasPublicAccess);
  }

  // Endpoint to monthly revenue statistics
 @Get('monthly-revenue')
  async getMonthlyRevenue(@Query('date') date: string) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }

    return this.salesService.getMonthlyRevenue(parsedDate);
  }

  // Endpoint to get sales statistics
  @Get('daily-sales')
  async getDailySalesCount(@Query('date') date: string){
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }

    return this.salesService.getDailySalesCount(parsedDate);
  }

  @Get('monthly-sales')
  async getMonthlyStatistics(@Query('date') date: number) {
    return this.salesService.getMonthlySalesCount(date);
  }

  @Get('yearly-sales')
  async getYearlyStatistics() {
    return this.salesService.getYearlySalesCount();
  }

  @Get('sales-by-device-type')
  async getSalesCountByDeviceType() {
    return this.salesService.getSalesCountByDeviceType();
  }

  @Get('sales-by-region')
  async getSalesCountByRegion() {
    return this.salesService.getSalesCountByRegion();
  }
}
