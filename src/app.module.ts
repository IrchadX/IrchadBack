// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { SalesModule } from './sales/sales.module';
import { OffersModule } from './offers/offers.module';
import { EnvironmentsModule } from './environments/environments.module';
import { ZonesModule } from './zones/zones.module';
import { PoisModule } from './pois/pois.module';
import { PrismaService } from './prisma/prisma.service';

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
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
