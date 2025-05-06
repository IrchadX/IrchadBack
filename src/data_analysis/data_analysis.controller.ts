import { Controller, Get, Res } from '@nestjs/common';
import { DataAnalysisService } from './data_analysis.service';
import { Response } from 'express';
import * as path from 'path'; // Importer 'path' pour résoudre les chemins

@Controller('analysis')
export class DataAnalysisController {
  constructor(private readonly dataAnalysisService: DataAnalysisService) {}

  @Get('export-csv')
  async exportPannes(@Res() res: Response) {
    // Spécifier le chemin absolu du fichier généré
    const filePath = await this.dataAnalysisService.getPannesDetails();

    // Vérifiez si le fichier existe, sinon renvoyez une erreur
    if (!filePath) {
      return res.status(500).send("Erreur lors de la génération du fichier.");
    }

    // Résoudre le chemin absolu pour le fichier CSV
    const absoluteFilePath = path.resolve(filePath);

    // Spécifier le type MIME pour le téléchargement d'un fichier CSV
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
}
