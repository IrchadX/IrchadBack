import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importation correcte

@Module({
  imports: [PrismaModule], // ✅ Assure-toi que PrismaModule est bien ici
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
