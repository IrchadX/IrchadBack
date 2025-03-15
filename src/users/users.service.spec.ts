import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from './users.module';
import { PrismaService } from '../prisma/prisma.service';
import * as dotenv from 'dotenv';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';


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
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await prisma.$disconnect();
    await app.close();
  });

  it('Should create a user (POST /users)', async () => {
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      family_name: 'Benkhelifa',
      first_name: 'Bouchra',
      phone_number: `061234${Math.floor(Math.random() * 10000)}`, 
      birth_date: '2003-10-04',
      sex: 'FEMALE', 
      city: 'Mila',
      street: 'Rue Didouche Mourad',
      userType: 1,
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(testUser)
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
    const response = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', userId);
  });

  it('Should update a user (PATCH /users/:id)', async () => {
    await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .send({ firstName: 'Samira' })
      .expect(200);

    const updatedUser = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200);

    expect(updatedUser.body.first_name).toBe('Samira');
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
