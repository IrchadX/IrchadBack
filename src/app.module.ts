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
  ],
  controllers: [AppController,GraphicsController],
  providers: [AppService,GraphicsService],
})
export class AppModule {}
