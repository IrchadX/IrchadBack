// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './api/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentsModule } from './api/environments/environments.module';
import { PoisModule } from './api/pois/pois.module';
import { DevicesModule } from './api/devices/devices.module';
import { SalesModule } from './api/sales/sales.module';
import { OffersModule } from './api/offers/offers.module';
import { APP_GUARD } from '@nestjs/core';
import { ReportsModule } from './api/reports/reports.module';
import { GatewayRolesGuard } from './decorators/gateway-roles.decorator';
import { StatisticsModule } from './api/statistics/statistics.module';
import { GraphicsModule } from './api/graphics/graphics.module';
import { GraphicsController } from './api/graphics/graphics.controller';
import { GraphicsService } from './api/graphics/graphics.service';
import { ZonesModule } from './api/zones/zones.module';
import { ZonesController } from './api/zones/zones.controller';
import { ZonesService } from './api/zones/zones.service';
import { DataAnalysisModule } from './data_analysis/data_analysis.module';
import { ProfilModule } from './api/profil/profil.module';
import { PoiCategoriesModule } from './api/poi-categories/poi-categories.module';
import { ZoneTypesModule } from './api/zone-types/zone-types.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    DevicesModule,
    SalesModule,
    OffersModule,
    EnvironmentsModule,
    ZonesModule,
    PoisModule,
    ReportsModule,
    StatisticsModule,
    GraphicsModule,
    ZonesModule,
    DataAnalysisModule,
    ProfilModule,
    PoiCategoriesModule,
    ZoneTypesModule,
  ],
  controllers: [AppController, GraphicsController, ZonesController],
  providers: [
    AppService,
    GraphicsService,
    ZonesService,
    {
      provide: APP_GUARD,
      useClass: GatewayRolesGuard,
    },
  ],
})
export class AppModule {}
