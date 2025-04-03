import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // Autoriser les requêtes depuis un autre domaine

  app.use('/uploads', express.static(join(__dirname, '../uploads'))); // Servir les fichiers statiques

  await app.listen(3001); // Port du back-end
}
bootstrap();
