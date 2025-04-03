import { Controller, Get, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import * as path from 'path';
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
/*
  @Get(':filename')
  downloadReport(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '../../uploads', filename);

    res.download(filePath, filename, (err) => {
      if (err) {
        res.status(500).send({ message: 'Erreur lors du téléchargement du fichier' });
      }
    });
  }*/
}
