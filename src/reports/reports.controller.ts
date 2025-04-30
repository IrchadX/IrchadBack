import { Controller, Get, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from '../dto/filter.dto';
import { Response } from 'express';
import { Roles } from '../api/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../api/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../api/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';

/*
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('decideur')*/
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('pdf')
  async generatePDF(@Query('year') yearParam: string, @Res() res: Response) {
    try {
      const year = parseInt(yearParam, 10);
      
      if (isNaN(year) || year < 1900 || year > 2100) {
        throw new HttpException('Année invalide', HttpStatus.BAD_REQUEST);
      }
      
      console.log('Année reçue dans le controller:', year);
            const filter: ReportFilterDto = {
        startDate: new Date(`${year}-01-01`).toISOString(),
        endDate: new Date(`${year}-12-31`).toISOString(),
      };
      
      const pdfBuffer = await this.reportsService.generateFleetStatusPDF(filter, year);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=rapport_${year}.pdf`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.end(pdfBuffer);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new HttpException(
        'Erreur lors de la génération du rapport PDF',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}