import { Controller, UseGuards, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/filter.dto';
import { Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('decideur')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('pdf')
  async getFleetStatusPDF(
    @Query() filter: ReportFilterDto,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.generateFleetStatusPDF(filter);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Rapport-Dispositifs.pdf',
    );
    res.send(pdfBuffer);
  }
}
