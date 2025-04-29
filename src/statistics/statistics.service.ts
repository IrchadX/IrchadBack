import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { alert } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}
//kpi1
  async getUserCount(): Promise<number> {
    return this.prisma.user.count();
  }

//kpi2
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
 //kpi3
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

//kpi4
  async getTechnicalInterventionPercentage(): Promise<number> {
    const total = await this.prisma.intervention_history.count();
    const techniques = await this.prisma.intervention_history.count({
      where: {
        type: 'technique',
      },
    });
  
    if (total === 0) return 0;
    return (techniques / total) * 100;
  }

//kpi5
  async getInactiveDeviceCount(): Promise<number> {
    return this.prisma.device.count({
      where: {
        comm_state: false,
      },
    });
  }
//kpi8
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


  //kpi5
   async getDeviceAvailabilityRate(): Promise<number> {
    const totalDevices = await this.prisma.device.count();
    const activeDevices = await this.prisma.device.count({
      where: {
        comm_state: true, 
      },
    });

    if (totalDevices === 0) return 0; 

    const availabilityRate = (activeDevices / totalDevices) * 100;
  return parseFloat(availabilityRate.toFixed(2)); // Retourne un nombre avec 2 décimales
  }

  // kpi6 : chiffre d'affaires de l'année
  async getAnnualRevenue(): Promise<number> {
    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);
    const lastDayOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);
  
    const devices = await this.prisma.device.findMany({
      where: {
        date_of_service: {
          gte: firstDayOfYear,
          lte: lastDayOfYear,
        },
      },
      select: {
        price: true,
      },
    });
  
    const totalRevenue = devices.reduce((sum, device) => sum + (device.price ?? 0), 0);
  
    return totalRevenue;
  }
  
}
