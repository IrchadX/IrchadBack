import { Controller, Get, Res } from '@nestjs/common';
import { DataAnalysisService } from './data_analysis.service';
import { Response } from 'express';
import * as path from 'path'; 
import * as fs from 'fs';
import { spawn } from 'child_process';

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

   
@Get('predict')
async predictSales(): Promise<any> {
  const csvPath = await this.dataAnalysisService.generateAlertsAndPannesStatsCSV();
  const scriptPath = path.resolve(__dirname, 'prediction', 'predict_sales.py');

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('py', [scriptPath, csvPath]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(result); 
          resolve(parsed);
        } catch (e) {
          reject(`Erreur lors du parsing JSON : ${e}`);
        }
      } else {
        reject(`Erreur Python : ${errorOutput || 'Code ' + code}`);
      }
    });
  });
}
}