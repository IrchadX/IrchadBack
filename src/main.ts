import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(join(__dirname, '../uploads')));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Enable CORS
  app.enableCors({
    origin: [
      'https://apigateway-production-f7c1.up.railway.app/',
      'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:3002',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
