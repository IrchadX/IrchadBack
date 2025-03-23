// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { EnvironmentsModule } from './environments/environments.module';
import { ZoneModule } from './zone/zone.module';
import { ZonesModule } from './zones/zones.module';
import { PoisModule } from './pois/pois.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes ConfigModule available globally
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    EnvironmentsModule,
    ZoneModule,
    ZonesModule,
    PoisModule,
  ],
})
export class AppModule {}
