import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as createCsvWriter from 'csv-writer';
import * as fs from 'fs';

@Injectable()
export class DataAnalysisService {
  constructor(private readonly prisma: PrismaService) {}

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
    });

    // Écriture dans le fichier CSV
    await csvWriter.writeRecords(result);

    return 'pannes_data.csv';
  }
}
