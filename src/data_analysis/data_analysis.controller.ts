import { Controller, Get, Res } from '@nestjs/common';
import { DataAnalysisService } from './data_analysis.service';
import { Response } from 'express';
import * as path from 'path'; // Importer 'path' pour résoudre les chemins

@Controller('analysis')
export class DataAnalysisController {
  constructor(private readonly dataAnalysisService: DataAnalysisService) {}

  @Get('export-csv')
  async exportPannes(@Res() res: Response) {
    const filePath = await this.dataAnalysisService.getPannesDetails();
    if (!filePath) {
      return res.status(500).send("Erreur lors de la génération du fichier.");
    }
    const absoluteFilePath = path.resolve(filePath);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pannes_data.csv"');

    // Servir le fichier en tant que téléchargement
    res.sendFile(absoluteFilePath, (err) => {
      if (err) {
        console.error("Erreur lors du téléchargement du fichier:", err);
        res.status(500).send("Erreur lors du téléchargement du fichier.");
      }
    });
  }



  @Get('sales')
  async getSalesByMonth() {
    return await this.dataAnalysisService.getGlobalSalesByMonth();
  }
   @Get('export-monthly-stats')
  async exportMonthlyStats(@Res() res: Response) {
    const filePath = await this.dataAnalysisService.generateMonthlyStatsCSV();
    if (!filePath) {
      return res.status(500).send("Erreur lors de la génération du fichier.");
    }
    const absoluteFilePath = path.resolve(filePath);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="monthly_stats.csv"');

    res.sendFile(absoluteFilePath, (err) => {
      if (err) {
        console.error("Erreur lors du téléchargement du fichier:", err);
        res.status(500).send("Erreur lors du téléchargement du fichier.");
      }
    });
  }
}


