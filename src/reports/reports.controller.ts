import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from '../dto/filter.dto';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('pdf')
  async getFleetStatusPDF(@Query() filter: ReportFilterDto, @Res() res: Response) {
    const pdfBuffer = await this.reportsService.generateFleetStatusPDF(filter);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Rapport-Dispositifs.pdf');
    res.send(pdfBuffer);
  }
}
