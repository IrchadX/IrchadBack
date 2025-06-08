import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as createCsvWriter from 'csv-writer'; 
import * as path from 'path';
@Injectable()
export class DataAnalysisService {
  constructor(private readonly prisma: PrismaService) {} 


async generateMonthlyStatsCSV(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(`${currentYear}-01-01T00:00:00Z`);
  const endDate = new Date(`${currentYear + 1}-01-01T00:00:00Z`);

  const monthLabels = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];

  // Requête pour les alertes
  const alerts = await this.prisma.alert.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    select: { date: true },
  });

  // Requête pour les ventes
  const purchases = await this.prisma.purchase_history.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    select: { date: true },
  });

  // Initialiser le comptage par mois
  const stats = monthLabels.map((label, index) => {
    const alertCount = alerts.filter(a => new Date(a.date).getMonth() === index).length;
    const purchaseCount = purchases.filter(p => new Date(p.date).getMonth() === index).length;

    return {
      mois: label,
      nb_alertes: alertCount,
      nb_ventes: purchaseCount,
    };
  });

  const filePath = path.resolve('monthly_stats.csv');

  const csvWriter = createCsvWriter.createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'mois', title: 'Mois' },
      { id: 'nb_alertes', title: 'Nombre d\'alertes' },
      { id: 'nb_ventes', title: 'Nombre de ventes' },
    ],
      fieldDelimiter: ';' 

  });

  await csvWriter.writeRecords(stats);

  return filePath;
}

  async getPannesDetails(): Promise<any> {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);

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
          select: {
            date: true,
            device: {
              select: {
                id: true, 
                device_type: {
                  select: {
                    type: true, 
                  },
                },
                user: {
                  select: {
                    id: true,   
                    family_name: true, 
                    first_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transformation des données pour le CSV
    const result = pannes
      .map(panne => {
        if (panne.alert?.device?.user) {
          return {
            user_id: panne.alert.device.user.id,
            user_name: `${panne.alert.device.user.first_name} ${panne.alert.device.user.family_name}`,
            date_panne: panne.alert.date,
            device_id: panne.alert.device.id,
            device_type_name: panne.alert.device.device_type.type,
          };
        } else {
          return null; 
        }
      })
      .filter(item => item !== null); 

    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: 'pannes_data.csv', 
      header: [
        { id: 'user_id', title: 'User ID' },
        { id: 'user_name', title: 'User Name' },
        { id: 'date_panne', title: 'Date Panne' },
        { id: 'device_id', title: 'Device ID' },
        { id: 'device_type_name', title: 'Device Type Name' },
      ],
        fieldDelimiter: ';' // <-- important pour une bonne lisibilité sous Excel en français

    });

    // Écriture dans le fichier CSV
    await csvWriter.writeRecords(result);

    return 'pannes_data.csv'; 
  }

  async getGlobalSalesByMonth(): Promise<{
  month: string;
  year: number;
  sales: number;
  message?: string;
}[]> {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const currentMonthIndex = new Date().getMonth(); // 0 = janvier, 5 = juin...

  const startDate = new Date(`${lastYear}-01-01T00:00:00Z`);
  const endDate = new Date(currentYear, currentMonthIndex + 1, 1); // début du mois suivant le mois actuel

  const sales = await this.prisma.purchase_history.findMany({
    where: {
      date: {
        gte: startDate,
        lt: endDate
      }
    },
    select: { date: true },
    orderBy: { date: 'asc' }
  });

  const monthLabels = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun",
                       "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];

  const salesByYearMonth: Record<number, Record<string, number>> = {
    [lastYear]: {},
    [currentYear]: {}
  };

  for (const { date } of sales) {
    if (date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const month = monthLabels[monthIndex];

      if (
        (year === lastYear) ||
        (year === currentYear && monthIndex <= currentMonthIndex)
      ) {
        salesByYearMonth[year][month] = (salesByYearMonth[year][month] || 0) + 1;
      }
    }
  }

  const result: {
    month: string;
    year: number;
    sales: number;
    message?: string;
  }[] = [];

  for (const year of [lastYear, currentYear]) {
    const monthsToInclude = year === lastYear
      ? monthLabels // inclure les 12 mois
      : monthLabels.slice(0, currentMonthIndex + 1); // jusqu'au mois actuel inclus

    let totalSales = 0;
    let count = 0;

    for (const month of monthsToInclude) {
      totalSales += salesByYearMonth[year][month] || 0;
      count++;
    }

    const average = totalSales / count;

    for (const month of monthsToInclude) {
      const sales = salesByYearMonth[year][month] || 0;
      let message: string | undefined;

      if (sales > average * 1.5) {
        message = `📈 Pic de ventes détecté en ${month} ${year} (${sales} ventes)`;
      }

      result.push({ month, year, sales, message });
    }
  }

  return result;
}
}