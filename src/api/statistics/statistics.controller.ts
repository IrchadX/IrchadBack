import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { alert } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('decideur')
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
      console.error(
        'Erreur lors de la récupération du nombre de dispositifs:',
        error,
      );
      return { totalDevice: 0 };
    }
  }
  @Get('inactive-device-count')
  async getInactiveDeviceCount(): Promise<{ totalInactiveDevices: number }> {
    const totalInactiveDevices =
      await this.statisticsService.getInactiveDeviceCount();
    return { totalInactiveDevices };
  }
  @Get('average-intervention-duration')
  async getAverageInterventionDuration(): Promise<{
    avgDuration: number | null;
  }> {
    const avgDuration =
      await this.statisticsService.getAverageInterventionDuration();
    return { avgDuration };
  }
  @Get('all-alerts')
  async getAllAlerts(): Promise<{ alerts: alert[] }> {
    const alerts = await this.statisticsService.getAllAlerts();
    return { alerts };
  }
  @Get('interventions')
  async getTechnicalInterventionPercentage() {
    const percentage =
      await this.statisticsService.getTechnicalInterventionPercentage();
    return { percentage: percentage.toFixed(2) }; // ex: { percentage: "78.57" }
  }
}
