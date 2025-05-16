import { Injectable } from '@nestjs/common';
import { ReportFilterDto } from './dto/filter.dto';
import { PrismaService } from '@/prisma/prisma.service';
import pdfMake from './pdfmake-wrapper';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

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

  async getPannesByDeviceType(year: number): Promise<
    Array<{
      deviceType: string;
      percentage: string;
      count: number;
    }>
  > {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const pannes = await this.prisma.panne_history.findMany({
      where: {
        alert: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
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

    const panneStats: Record<string, number> = pannes.reduce(
      (acc, panne) => {
        const deviceType = panne.alert?.device?.device_type?.type || 'Unknown';
        acc[deviceType] = (acc[deviceType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalPannes = pannes.length;
    return Object.entries(panneStats).map(([deviceType, count]) => ({
      deviceType,
      percentage: ((count / totalPannes) * 100).toFixed(2),
      count,
    }));
  }

  async getFleetStatusReport(filter: ReportFilterDto) {
    const dateFilter = this.getDateFilter(filter);

    const [total, inService, inMaintenance, faulty] = await Promise.all([
      this.prisma.device.count({ where: { date_of_service: dateFilter } }),
      this.prisma.device.count({
        where: {
          date_of_service: dateFilter,
          state_type: { state: 'en service' },
        },
      }),
      this.prisma.device.count({
        where: {
          date_of_service: dateFilter,
          state_type: { state: 'en panne' },
        },
      }),
      this.prisma.device.count({
        where: {
          date_of_service: dateFilter,
          state_type: { state: 'deffectueux' },
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

  async getAlertLevelsReport(year: number): Promise<
    Array<{
      level: string;
      percentage: string;
      count: number;
    }>
  > {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const pannes = await this.prisma.panne_history.findMany({
      where: {
        alert: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
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

    const alertStats: Record<string, number> = pannes.reduce(
      (acc, panne) => {
        const alertLevel = panne.alert?.level || 'Unknown';
        acc[alertLevel] = (acc[alertLevel] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalPannes = pannes.length;
    return Object.entries(alertStats).map(([level, count]) => ({
      level,
      percentage: ((count / totalPannes) * 100).toFixed(2),
      count,
    }));
  }

  async getDevicesByType(year: number): Promise<
    Array<{
      deviceType: string;
      count: number;
      percentage: string;
    }>
  > {
    const devices = await this.prisma.device.findMany({
      where: {
        date_of_service: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
      include: {
        device_type: true,
      },
    });

    const typeStats: Record<string, number> = devices.reduce(
      (acc, device) => {
        const type = device.device_type?.type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const total = devices.length;
    return Object.entries(typeStats).map(([deviceType, count]) => ({
      deviceType,
      count,
      percentage: ((count / total) * 100).toFixed(2),
    }));
  }

  async getAverageMaintenanceDuration(year: number): Promise<{
    averageDurationDays: string;
    count: number;
  }> {
    const interventions = await this.prisma.intervention_history.findMany({
      where: {
        completion_date: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    });

    if (interventions.length === 0) {
      return { averageDurationDays: '0.00', count: 0 };
    }

    const totalDurationMs = interventions.reduce((acc, intervention) => {
      const { scheduled_date, completion_date } = intervention;
      if (!scheduled_date || !completion_date) return acc;
      return (
        acc +
        (new Date(completion_date).getTime() -
          new Date(scheduled_date).getTime())
      );
    }, 0);

    const averageDurationDays = (
      totalDurationMs /
      interventions.length /
      (1000 * 60 * 60 * 24)
    ).toFixed(2);

    return {
      averageDurationDays,
      count: interventions.length,
    };
  }

  async generateFleetStatusPDF(
    filter: ReportFilterDto,
    year: number,
  ): Promise<Buffer> {
    const fleetStatusData = await this.getFleetStatusReport(filter);
    const pannePercentages = await this.getPannesByDeviceType(year);
    const alertLevelsData = await this.getAlertLevelsReport(year);
    const deviceTypeStats = await this.getDevicesByType(year);
    const averageMaintenance = await this.getAverageMaintenanceDuration(year);

    const docDefinition = {
      content: [
        { text: 'Rapport statistique de dispositifs', style: 'header' },
        {
          text: `Date de génération : ${new Date().toLocaleDateString()}`,
          alignment: 'right',
          margin: [0, 0, 0, 10],
        },
        { text: 'État général ', style: 'subHeader' },
        { text: `Total dispositifs : ${fleetStatusData.totalDevices}` },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                'En service',
                `${fleetStatusData.inService} (${fleetStatusData.percentageInService}%)`,
              ],
              [
                'En panne',
                `${fleetStatusData.inMaintenance} (${fleetStatusData.percentageInMaintenance}%)`,
              ],
              [
                'Déffectueux',
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

        { text: '\nDurée moyenne de maintenance', style: 'subHeader' },
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
