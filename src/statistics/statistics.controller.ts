import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { alert } from '@prisma/client';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('users-count')
  async getUserCount(): Promise<{ totalUsers: number }> {
    const totalUsers = await this.statisticsService.getUserCount();
    return { totalUsers };
  }
  @Get('alerts-count')
  async getAlertsCount(): Promise<{ totalAlerts: number }> {
    const totalAlerts = await this.statisticsService.getAlertsCount();
    return { totalAlerts };
  }
  @Get('device-count')
  async getDeviceCount(): Promise<{ totalDevice: number }> {
    try {
      const totalDevice = await this.statisticsService.getDeviceCount();
      return { totalDevice };
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de dispositifs:', error);
      return { totalDevice: 0 }; // Retourne 0 en cas d'erreur
    }
  }
  @Get('inactive-device-count')
  async getInactiveDeviceCount(): Promise<{ totalInactiveDevices: number }> {
    const totalInactiveDevices = await this.statisticsService.getInactiveDeviceCount();
    return { totalInactiveDevices };
  }
  @Get('average-intervention-duration')
  async getAverageInterventionDuration(): Promise<{ avgDuration: number | null }> {
    const avgDuration = await this.statisticsService.getAverageInterventionDuration();
    return { avgDuration };
  }
  @Get('all-alerts')
  async getAllAlerts(): Promise<{ alerts: alert[] }> { 
    const alerts = await this.statisticsService.getAllAlerts();
    return { alerts };
  }
  
}
