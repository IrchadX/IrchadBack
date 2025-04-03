import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchDataFromPrisma() {
    const totalDevices = await this.prisma.device.count();
    const inactiveDevices = await this.prisma.device.count({
      where: { comm_state: false }
    });

    const abandonByDeviceType = await this.prisma.device.groupBy({
      by: ['type_id'],
      _count: { id: true },
      where: { comm_state: false }
    });

    const deviceTypes = await this.prisma.device_type.findMany();
    const deviceTypeMap = Object.fromEntries(deviceTypes.map(d => [d.id, d.type]));

    const formattedAbandonByDeviceType = abandonByDeviceType.map(item => ({
      type: deviceTypeMap[item.type_id ?? 0] || 'Inconnu',
      count: typeof item._count === 'object' ? item._count?.id ?? 0 : 0,
    }));
    

    return {
      totalDevices,
      inactiveDevices,
      abandonByDeviceType: formattedAbandonByDeviceType,
    };
  }

  async generateAbandonReport(): Promise<string> {
    const reportData = await this.fetchDataFromPrisma();
    if (!reportData) {
      console.error('Échec de la récupération des données.');
      return '';
    }

    const filePath = 'abandon_report.pdf';
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const logoPath = path.join(__dirname, 'logoo.png');
    console.log("🔍 Chemin du logo :", logoPath);
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 220, 30, { width: 150 });
    }

    doc.moveDown(3);
    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('Rapport d\'Abandon des Appareils', { align: 'center' })
      .moveDown(2);

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(`Nombre total d'appareils : ${reportData.totalDevices}`)
      .moveDown(0.5);
    doc
      .text(`Nombre d'appareils inactifs : ${reportData.inactiveDevices}`)
      .moveDown(1.5);

    // ✅ Création de la table
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Abandon par type d’appareil :', { underline: true })
      .moveDown(1);

    const startX = 100;
    const startY = doc.y;
    const columnWidths = [250, 150];
    const rowHeight = 25;

    // ✅ En-tête du tableau
    doc.rect(startX, startY, columnWidths[0], rowHeight).stroke();
    doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight).stroke();
    doc.text('Type d\'appareil', startX + 10, startY + 7);
    doc.text('Nombre', startX + columnWidths[0] + 10, startY + 7);

    // ✅ Contenu du tableau
    let yOffset = startY + rowHeight;
    reportData.abandonByDeviceType.forEach((item) => {
      doc.rect(startX, yOffset, columnWidths[0], rowHeight).stroke();
      doc.rect(startX + columnWidths[0], yOffset, columnWidths[1], rowHeight).stroke();
      doc.text(item.type, startX + 10, yOffset + 7);
      doc.text(item.count.toString(), startX + columnWidths[0] + 10, yOffset + 7);
      yOffset += rowHeight;
    });

    doc.end();

    return filePath;
  }
}
