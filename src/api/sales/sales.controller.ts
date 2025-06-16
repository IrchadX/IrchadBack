import { Controller, UseGuards, Get, Post, Body, Query } from '@nestjs/common';
import { SalesService, MarketPenetrationData, MonthlyProductsData } from './sales.service';

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

  @Get('cogs')
  async getCOGS(@Query('date') date: string) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }
    return this.salesService.getCOGS(parsedDate);
  }

  @Get('expenses')
  async getExpenses(@Query('date') date: string) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }
    return this.salesService.getExpenses(parsedDate);
  }

  @Get('gross-margin')
  async getGrossMargin(@Query('date') date: string) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }
    return this.salesService.calculateGrossMargin(parsedDate);
  }

  @Get('net-margin')
  async getNetMargin(@Query('date') date: string) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }
    return this.salesService.calculateNetMargin(parsedDate);
  }

  @Get('market-penetration')
  async getMarketPenetration(@Query('date') date: string): Promise<MarketPenetrationData[]> {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
      }
      return this.salesService.getMarketPenetrationByRegion(parsedDate);
    } catch (error) {
      throw new Error(`Failed to get market penetration data: ${error.message}`);
    }
  }

  @Get('monthly-products')
  async getMonthlyProducts(@Query('date') date: string): Promise<MonthlyProductsData> {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
      }
      return this.salesService.getMonthlyProductsSold(parsedDate);
    } catch (error) {
      throw new Error(`Failed to get monthly products data: ${error.message}`);
    }
  }
}
