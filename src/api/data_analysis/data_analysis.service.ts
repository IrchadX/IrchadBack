import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as createCsvWriter from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
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

    const result = pannes
      .map((panne) => {
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
      .filter((item) => item !== null);

    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: 'pannes_data.csv',
      header: [
        { id: 'user_id', title: 'User ID' },
        { id: 'user_name', title: 'User Name' },
        { id: 'date_panne', title: 'Date Panne' },
        { id: 'device_id', title: 'Device ID' },
        { id: 'device_type_name', title: 'Device Type Name' },
      ],
        fieldDelimiter: ';' 

    });

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
  const currentMonthIndex = new Date().getMonth(); 

  const startDate = new Date(`${lastYear}-01-01T00:00:00Z`);
  const endDate = new Date(currentYear, currentMonthIndex + 1, 1); 

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
      : monthLabels.slice(0, currentMonthIndex + 1); 

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



async generateAlertsAndPannesStatsCSV(): Promise<string> {
  const monthLabels = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];

  const alerts = await this.prisma.alert.findMany({
    select: { id: true, date: true },
  });

  const pannes = await this.prisma.panne_history.findMany({
    include: {
      alert: {
        select: { date: true },
      },
    },
  });

  const purchases = await this.prisma.purchase_history.findMany({
    select: { id: true, date: true },
  });

  const statsMap = new Map<string, { nb_alertes: number; nb_pannes: number; nb_ventes: number }>();

  // Compter les alertes
  for (const a of alerts) {
    const date = new Date(a.date);
    const key = `${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
    const stat = statsMap.get(key) ?? { nb_alertes: 0, nb_pannes: 0, nb_ventes: 0 };
    stat.nb_alertes += 1;
    statsMap.set(key, stat);
  }

  // Compter les pannes
  for (const p of pannes) {
    if (p.alert?.date) {
      const date = new Date(p.alert.date);
      const key = `${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
      const stat = statsMap.get(key) ?? { nb_alertes: 0, nb_pannes: 0, nb_ventes: 0 };
      stat.nb_pannes += 1;
      statsMap.set(key, stat);
    }
  }

  // Compter les ventes
  for (const p of purchases) {
    const date = new Date(p.date);
    const key = `${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
    const stat = statsMap.get(key) ?? { nb_alertes: 0, nb_pannes: 0, nb_ventes: 0 };
    stat.nb_ventes += 1;
    statsMap.set(key, stat);
  }

  // Trier les clés par année puis mois
  const sortedKeys = Array.from(statsMap.keys()).sort((a, b) => {
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    const monthIndex = (m: string) => monthLabels.indexOf(m);
    return Number(yearA) - Number(yearB) || monthIndex(monthA) - monthIndex(monthB);
  });

  // Créer le contenu du CSV
  const header = 'Mois;Nombre d\'alertes;Nombre de pannes;Nombre de ventes';
  const rows = sortedKeys.map(key => {
    const s = statsMap.get(key)!;
    return `${key};${s.nb_alertes};${s.nb_pannes};${s.nb_ventes}`;
  });

  const content = [header, ...rows].join('\n');

  // Sauvegarder le fichier
  const filePath = path.join('export', 'alertes_pannes_par_mois.csv');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');

  // Retourner le chemin absolu
  return path.resolve(filePath);
}

}