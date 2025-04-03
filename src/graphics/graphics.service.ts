import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
