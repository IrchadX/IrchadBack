import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { alert } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserCount(): Promise<number> {
    return this.prisma.user.count();
  }

  async getAlertsCount(): Promise<number> {
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const lastDayOfMonth = new Date();

    return this.prisma.alert.count({
      where: {
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });
  }

  async getDeviceCount(): Promise<number> {
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const lastDayOfMonth = new Date();

    return this.prisma.device.count({
      where: {
        date_of_service: {  
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });
  }

  async getInactiveDeviceCount(): Promise<number> {
    return this.prisma.device.count({
      where: {
        comm_state: false,
      },
    });
  }

  async getAverageInterventionDuration(): Promise<number | null> {
    const result = await this.prisma.$queryRaw<{ avg_duration: number }[]>`
      SELECT AVG(EXTRACT(EPOCH FROM (completion_date - scheduled_date)) / 3600) AS avg_duration
      FROM intervention_history
      WHERE status = 'completed'
    `;

    return result[0]?.avg_duration ?? null;
  }

  async getAllAlerts(): Promise<alert[]> {
    return this.prisma.alert.findMany();
  }
  
  
}
