import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportFilterDto } from './dto/filter.dto';
import pdfMake from './pdfmake-wrapper';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private getDateFilter(filter: ReportFilterDto): { gte?: Date; lte?: Date } {
    if (!filter.startDate || !filter.endDate) return {};
    return {
      gte: new Date(filter.startDate),
      lte: new Date(filter.endDate),
    };
  }

  // Récupérer les statistiques de pannes par type de dispositif
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

  async getFleetStatusReport(filter: ReportFilterDto) {
    const dateFilter = this.getDateFilter(filter);

    const [total, inService, inMaintenance, faulty] = await Promise.all([
      this.prisma.device.count({ where: { date_of_service: dateFilter } }),
      this.prisma.device.count({
        where: {
          date_of_service: dateFilter,
          state_type: {
            state: 'en_service',
          },
        },
      }),
      this.prisma.device.count({
        where: {
          date_of_service: dateFilter,
          state_type: {
            state: 'en_maintenance',
          },
        },
      }),
      this.prisma.device.count({
        where: {
          date_of_service: dateFilter,
          state_type: {
            state: 'defectueux',
          },
        },
      }),
    ]);

    return {
      totalDevices: total,
      inService,
      inMaintenance,
      faulty,
      percentageInService: total ? ((inService / total) * 100).toFixed(2) : '0',
      percentageInMaintenance: total
        ? ((inMaintenance / total) * 100).toFixed(2)
        : '0',
      percentageFaulty: total ? ((faulty / total) * 100).toFixed(2) : '0',
    };
  }
  async getAlertLevelsReport(): Promise<any> {
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

    const alertStats = pannes.reduce((acc, panne) => {
      const alertLevel = panne.alert?.level; // On suppose que 'level' est un champ de l'alerte

      if (alertLevel) {
        if (!acc[alertLevel]) {
          acc[alertLevel] = 1;
        } else {
          acc[alertLevel]++;
        }
      }
      return acc;
    }, {});

    const totalPannes = pannes.length;
    const alertLevelPercentages = Object.keys(alertStats).map((level) => {
      return {
        level,
        percentage: ((alertStats[level] / totalPannes) * 100).toFixed(2), // pourcentage
        count: alertStats[level], // nombre de pannes par niveau d'alerte
      };
    });

    return alertLevelPercentages;
  }
  async getDevicesByType(): Promise<any> {
    const devices = await this.prisma.device.findMany({
      include: {
        device_type: true,
      },
    });

    const typeStats = devices.reduce(
      (acc, device) => {
        const type = device.device_type?.type || 'Inconnu';

        if (!acc[type]) {
          acc[type] = 1;
        } else {
          acc[type]++;
        }

        return acc;
      },
      {} as Record<string, number>,
    );

    const total = devices.length;
    const typePercentages = Object.entries(typeStats).map(([type, count]) => ({
      deviceType: type,
      count,
      percentage: ((count / total) * 100).toFixed(2),
    }));

    return typePercentages;
  }
  async getAverageMaintenanceDuration(): Promise<any> {
    const interventions = await this.prisma.intervention_history.findMany({
      where: {
        NOT: [{ completion_date: null }],
      },
    });

    if (interventions.length === 0) {
      return { averageDurationDays: 0, count: 0 };
    }

    const totalDurationMs = interventions.reduce((acc, intervention) => {
      const { scheduled_date, completion_date } = intervention; // <= ici tu déclares les deux

      if (!scheduled_date || !completion_date) return acc;

      const start = new Date(scheduled_date).getTime();
      const end = new Date(completion_date).getTime();
      const duration = end - start;
      return acc + duration;
    }, 0);

    const averageDurationMs = totalDurationMs / interventions.length;
    const averageDurationDays = (
      averageDurationMs /
      (1000 * 60 * 60 * 24)
    ).toFixed(2);

    return {
      averageDurationDays,
      count: interventions.length,
    };
  }
  async generateFleetStatusPDF(filter: ReportFilterDto): Promise<Buffer> {
    const fleetStatusData = await this.getFleetStatusReport(filter);
    const pannePercentages = await this.getPannesByDeviceType();
    const alertLevelsData = await this.getAlertLevelsReport();
    const deviceTypeStats = await this.getDevicesByType();
    const averageMaintenance = await this.getAverageMaintenanceDuration();

    const docDefinition = {
      content: [
        { text: 'Rapport de dispositifs', style: 'header' },

        { text: 'État général de la flotte', style: 'subHeader' },
        {
          table: {
            widths: ['*', '*'],
            body: [
              ['Total dispositifs', `${fleetStatusData.totalDevices}`],
              [
                'En service',
                `${fleetStatusData.inService} (${fleetStatusData.percentageInService}%)`,
              ],
              [
                'En maintenance',
                `${fleetStatusData.inMaintenance} (${fleetStatusData.percentageInMaintenance}%)`,
              ],
              [
                'Défectueux',
                `${fleetStatusData.faulty} (${fleetStatusData.percentageFaulty}%)`,
              ],
            ],
          },
        },

        { text: '\nRépartition des dispositifs par type', style: 'subHeader' },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              ['Type de dispositif', 'Nombre', 'Pourcentage'],
              ...deviceTypeStats.map((stat) => [
                stat.deviceType,
                stat.count,
                `${stat.percentage}%`,
              ]),
            ],
          },
        },

        { text: '\nPannes par Type de Dispositif', style: 'subHeader' },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              ['Type de dispositif', 'Nombre de pannes', 'Pourcentage'],
              ...pannePercentages.map((stat) => [
                stat.deviceType,
                stat.count,
                `${stat.percentage}%`,
              ]),
            ],
          },
        },

        { text: '\nTaux des alertes par niveau', style: 'subHeader' },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              ["Niveau d'alerte", "Nombre d'alertes", 'Pourcentage'],
              ...alertLevelsData.map((alert) => [
                alert.level,
                alert.count,
                `${alert.percentage}%`,
              ]),
            ],
          },
        },

        {
          text: '\nDurée moyenne de maintenance',
          style: 'subHeader',
        },
        {
          text: `Nombre d'interventions analysées : ${averageMaintenance.count}`,
        },
        {
          text: `Durée moyenne : ${averageMaintenance.averageDurationDays} jours`,
        },
      ],

      styles: {
        header: {
          alignment: 'center',
          fontSize: 20,
          margin: [0, 10, 0, 20],
          bold: true,
        },
        subHeader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        table: {
          margin: [0, 5, 0, 5],
        },
      },
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    return new Promise((resolve, reject) => {
      pdfDocGenerator.getBuffer((buffer: ArrayBuffer) => {
        resolve(Buffer.from(buffer));
      });
    });
  }
}
