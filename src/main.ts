import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // Autoriser les requêtes depuis un autre domaine

  app.use('/uploads', express.static(join(__dirname, '../uploads'))); // Servir les fichiers statiques
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(3001); // Port du back-end
}
bootstrap();
