import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GraphicsService {
  constructor(private prisma: PrismaService) {}
  async getPannesByDeviceType(): Promise<any> {
    const pannes = await this.prisma.panne_history.findMany({
      include: {
        alert: {
          include: {
            device: {
              include: {
                device_type: true,
              },
            },
          },
        },
      },
    });

    const panneStats = pannes.reduce((acc, panne) => {
      const deviceType = panne.alert?.device?.device_type?.type;

      if (deviceType) {
        if (!acc[deviceType]) {
          acc[deviceType] = 1;
        } else {
          acc[deviceType]++;
        }
      }
      return acc;
    }, {});

    const totalPannes = pannes.length;
    const pannePercentages = Object.keys(panneStats).map((type) => {
      return {
        deviceType: type,
        percentage: ((panneStats[type] / totalPannes) * 100).toFixed(2), // pourcentage
        count: panneStats[type], // nombre de pannes
      };
    });

    return pannePercentages;
  }
  async getGlobalSalesByMonth(): Promise<any[]> {
    const currentYear = new Date().getFullYear();

    const sales = await this.prisma.purchase_history.findMany({
      where: {
        date: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
      select: { date: true },
    });

    const monthLabels = [
      'Jan',
      'Fev',
      'Mar',
      'Avr',
      'Mai',
      'Jun',
      'Jul',
      'Aou',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const salesByMonth: Record<string, number> = {};

    sales.forEach(({ date }) => {
      if (date) {
        const d = new Date(date);
        const month = monthLabels[d.getMonth()];
        salesByMonth[month] = (salesByMonth[month] || 0) + 1;
      }
    });

    return monthLabels.map((month) => ({
      month,
      sales: salesByMonth[month] || 0,
    }));
  }
}
