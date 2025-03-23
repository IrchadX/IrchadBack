/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from './users.module';
import { PrismaService } from '../prisma/prisma.service';
import * as dotenv from 'dotenv';

describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: number;

  beforeAll(async () => {
    dotenv.config();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    // Nettoyage des données créées pour éviter les conflits dans d'autres tests
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await prisma.$disconnect();
    await app.close();
  });

  it('Should create a user (POST /users)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ 
        email: `test${Date.now()}@example.com`, 
        password: 'password123', 
        familyName: 'Benkhelifa',
        firstName: 'Bouchra',
        phoneNumber: '0612345978',
        birth_date: '2003-10-04', 
        sex: 'F',
        city: 'Mila',
        street: 'Rue Didouche Mourad',
        userTypeId: 1
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toContain('@example.com');

    userId = response.body.id; 
  });

 it('Should get all users (GET /users)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('Should get one user by ID (GET /users/:id)', async () => {
    const userId = 1; // ID statique
    const response = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', userId);
  });
  it('Should get one user by familyName (GET /users/family-name/:familyName)', async () => {
    const familyName = 'Doe'; // Valeur statique pour le test
  
    const response = await request(app.getHttpServer())
      .get(`/users/family-name/${familyName}`) // Assure-toi que ton API supporte ce format
      .expect(200);
  
    expect(response.body).toHaveProperty('familyName', familyName);
  });
  
  it('Should delete a user (DELETE /users/:id)', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(200);

    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    expect(foundUser).toBeNull();
  });
});
