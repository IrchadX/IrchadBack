// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './api/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './api/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentsModule } from './api/environments/environments.module';
import { ZonesModule } from './api/zones/zones.module';
import { PoisModule } from './api/pois/pois.module';
import { DevicesModule } from './api/devices/devices.module';
import { SalesModule } from './api/sales/sales.module';
import { OffersModule } from './api/offers/offers.module';
import { PrismaService } from './prisma/prisma.service';
import { ReportsModule } from './api/reports/reports.module';
import { StatisticsModule } from './api/statistics/statistics.module';
import { GraphicsModule } from './api/graphics/graphics.module';
import { GraphicsController } from './api/graphics/graphics.controller';
import { GraphicsService } from './api/graphics/graphics.service';
import { PoiCategoriesModule } from './poi-categories/poi-categories.module';
import { ZoneTypesModule } from './zone-types/zone-types.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    DevicesModule,
    SalesModule,
    OffersModule,
    EnvironmentsModule,
    ZonesModule,
    PoisModule,
    ReportsModule,
    StatisticsModule,
    GraphicsModule,
    PoiCategoriesModule,
    ZoneTypesModule,
  ],
  controllers: [AppController, GraphicsController],
  providers: [AppService, PrismaService, GraphicsService],
})
export class AppModule {}
