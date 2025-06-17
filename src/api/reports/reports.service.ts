import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportFilterDto } from './dto/filter.dto';

// Alternative import method
const PdfMake = require('pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

@Injectable()
export class ReportsService {
  private pdfMake: any;

  constructor(private prisma: PrismaService) {
    // Initialize pdfMake with fonts
    this.initializePdfMake();
  }

  private initializePdfMake() {
    const fonts = {
      Roboto: {
        normal: Buffer.from(
          pdfFonts.pdfMake.vfs['Roboto-Regular.ttf'],
          'base64',
        ),
        bold: Buffer.from(pdfFonts.pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
        italics: Buffer.from(
          pdfFonts.pdfMake.vfs['Roboto-Italic.ttf'],
          'base64',
        ),
        bolditalics: Buffer.from(
          pdfFonts.pdfMake.vfs['Roboto-MediumItalic.ttf'],
          'base64',
        ),
      },
    };

    this.pdfMake = new PdfMake(fonts);
  }

  private getDateFilter(filter: ReportFilterDto): { gte?: Date; lte?: Date } {
    if (!filter.startDate || !filter.endDate) return {};
    return {
      gte: new Date(filter.startDate),
      lte: new Date(filter.endDate),
    };
  }

  async getPannesByDeviceType(year: number): Promise<any> {
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

    console.log(
      `Récupération des pannes pour l'année ${year}: ${pannes.length} résultats`,
    );

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
        percentage: ((panneStats[type] / totalPannes) * 100).toFixed(2),
        count: panneStats[type],
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

  async getAlertLevelsReport(year: number): Promise<any> {
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

    console.log(
      `Récupération des alertes pour l'année ${year}: ${pannes.length} résultats`,
    );

    const alertStats = pannes.reduce((acc, panne) => {
      const alertLevel = panne.alert?.level;

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
        percentage: ((alertStats[level] / totalPannes) * 100).toFixed(2),
        count: alertStats[level],
      };
    });

    return alertLevelPercentages;
  }

  async getDevicesByType(year: number): Promise<any> {
    console.log('Année récupérée:', year);
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

  async getAverageMaintenanceDuration(year: number): Promise<any> {
    const interventions = await this.prisma.intervention_history.findMany({
      where: {
        completion_date: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
    });

    if (interventions.length === 0) {
      return { averageDurationDays: 0, count: 0 };
    }

    const totalDurationMs = interventions.reduce((acc, intervention) => {
      const { scheduled_date, completion_date } = intervention;

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

  async generateFleetStatusPDF(
    filter: ReportFilterDto,
    year: number,
  ): Promise<Buffer> {
    try {
      console.log('Starting PDF generation for year:', year);

      // Fetch all data first
      const [
        fleetStatusData,
        pannePercentages,
        alertLevelsData,
        deviceTypeStats,
        averageMaintenance,
      ] = await Promise.all([
        this.getFleetStatusReport(filter),
        this.getPannesByDeviceType(year),
        this.getAlertLevelsReport(year),
        this.getDevicesByType(year),
        this.getAverageMaintenanceDuration(year),
      ]);

      console.log('Data fetched successfully:', {
        fleetStatus: fleetStatusData,
        pannes: pannePercentages.length,
        alerts: alertLevelsData.length,
        devices: deviceTypeStats.length,
        maintenance: averageMaintenance,
      });

      const docDefinition = {
        defaultStyle: {
          font: 'Roboto',
          fontSize: 10,
        },
        content: [
          {
            text: 'Rapport de dispositifs',
            style: 'header',
            margin: [0, 0, 0, 20],
          },
          {
            text: `Date de génération : ${new Date().toLocaleDateString('fr-FR')}`,
            alignment: 'right',
            margin: [0, 0, 0, 20],
          },

          { text: 'État général de la flotte', style: 'subHeader' },
          {
            text: `Total dispositifs : ${fleetStatusData.totalDevices}`,
            margin: [0, 5, 0, 10],
            fontSize: 12,
          },
          {
            table: {
              headerRows: 1,
              widths: ['50%', '50%'],
              body: [
                [
                  { text: 'État', style: 'tableHeader' },
                  { text: 'Nombre (%)', style: 'tableHeader' },
                ],
                [
                  'En service',
                  `${fleetStatusData.inService} (${fleetStatusData.percentageInService}%)`,
                ],
                [
                  'En panne',
                  `${fleetStatusData.inMaintenance} (${fleetStatusData.percentageInMaintenance}%)`,
                ],
                [
                  'Défectueux',
                  `${fleetStatusData.faulty} (${fleetStatusData.percentageFaulty}%)`,
                ],
              ],
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20],
          },

          { text: 'Répartition des dispositifs par type', style: 'subHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['40%', '30%', '30%'],
              body: [
                [
                  { text: 'Type de dispositif', style: 'tableHeader' },
                  { text: 'Nombre', style: 'tableHeader' },
                  { text: 'Pourcentage', style: 'tableHeader' },
                ],
                ...deviceTypeStats.map((stat) => [
                  stat.deviceType || 'N/A',
                  stat.count.toString(),
                  `${stat.percentage}%`,
                ]),
              ],
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20],
          },

          { text: 'Pannes par Type de Dispositif', style: 'subHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['40%', '30%', '30%'],
              body: [
                [
                  { text: 'Type de dispositif', style: 'tableHeader' },
                  { text: 'Nombre de pannes', style: 'tableHeader' },
                  { text: 'Pourcentage', style: 'tableHeader' },
                ],
                ...pannePercentages.map((stat) => [
                  stat.deviceType || 'N/A',
                  stat.count.toString(),
                  `${stat.percentage}%`,
                ]),
              ],
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20],
          },

          { text: 'Taux des alertes par niveau', style: 'subHeader' },
          {
            table: {
              headerRows: 1,
              widths: ['40%', '30%', '30%'],
              body: [
                [
                  { text: "Niveau d'alerte", style: 'tableHeader' },
                  { text: "Nombre d'alertes", style: 'tableHeader' },
                  { text: 'Pourcentage', style: 'tableHeader' },
                ],
                ...alertLevelsData.map((alert) => [
                  alert.level || 'N/A',
                  alert.count.toString(),
                  `${alert.percentage}%`,
                ]),
              ],
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20],
          },

          { text: 'Durée moyenne de maintenance', style: 'subHeader' },
          {
            ul: [
              `Nombre d'interventions analysées : ${averageMaintenance.count}`,
              `Durée moyenne : ${averageMaintenance.averageDurationDays} jours`,
            ],
            margin: [0, 5, 0, 10],
          },
        ],

        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
          },
          subHeader: {
            fontSize: 14,
            bold: true,
            margin: [0, 15, 0, 10],
          },
          tableHeader: {
            bold: true,
            fillColor: '#eeeeee',
            margin: [0, 5, 0, 5],
          },
        },

        pageMargins: [40, 60, 40, 60],
      };

      console.log('Creating PDF document...');

      return new Promise((resolve, reject) => {
        try {
          const pdfDoc = this.pdfMake.createPdfKitDocument(docDefinition);
          const chunks: Buffer[] = [];

          pdfDoc.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });

          pdfDoc.on('end', () => {
            const result = Buffer.concat(chunks);
            console.log('PDF generated successfully, size:', result.length);

            if (result.length === 0) {
              reject(new Error('Generated PDF is empty'));
              return;
            }

            resolve(result);
          });

          pdfDoc.on('error', (error: any) => {
            console.error('PDF generation error:', error);
            reject(error);
          });

          pdfDoc.end();
        } catch (error) {
          console.error('Error creating PDF:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error in generateFleetStatusPDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }
}
