// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
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
    ReportsModule,
    StatisticsModule,
    GraphicsModule,
    ZonesModule,
  ],
  controllers: [AppController,GraphicsController,ZonesController],
  providers: [AppService,GraphicsService,ZonesService],
})
export class AppModule {}
