// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './api/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './api/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './api/devices/devices.module';
import { EnvironmentsModule } from './api/environments/environments.module';
import { PoisModule } from './api/pois/pois.module';
import { PrismaService } from './prisma/prisma.service';
import { ReportsModule } from './reports/reports.module';
import { StatisticsModule } from './statistics/statistics.module';
import { GraphicsModule } from './graphics/graphics.module';
import { GraphicsController } from './graphics/graphics.controller'; 
import { GraphicsService } from './graphics/graphics.service'; 
import { ZonesModule } from './zones/zones.module';
import { ZonesController } from './zones/zones.controller';
import { ZonesService } from './zones/zones.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    DevicesModule,
    EnvironmentsModule,
    ZonesModule,
    PoisModule,
    ReportsModule,
    StatisticsModule,
    GraphicsModule,
    ZonesModule,
  ],
  controllers: [AppController,GraphicsController,ZonesController],
  providers: [AppService,GraphicsService,ZonesService],
})
export class AppModule {}
