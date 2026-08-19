import 'reflect-metadata';

import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PlatformRole } from '../generated/prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/shared/infrastructure/database/prisma/prisma.service';

describe('Exercises HTTP flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminId: string;
  let adminEmail: string;
  let createdExerciseId: string | undefined;
  let publicExerciseSlug: string;

  const password = 'KinetiQ-exercise-e2e-password-123!';

  function getBodyString(body: unknown, key: string): string {
    if (
      typeof body !== 'object' ||
      body === null ||
      !(key in body) ||
      typeof body[key] !== 'string'
    ) {
      throw new Error(`Response body did not include a string ${key}.`);
    }
    return body[key];
  }

  async function signInAdmin(): Promise<string[]> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({ email: adminEmail, password })
      .expect(200);

    const cookies = response.headers['set-cookie'];
    if (!Array.isArray(cookies) || cookies.length === 0) {
      throw new Error('Admin sign-in did not return a session cookie.');
    }
    return cookies;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    const publicExercise = await prisma.exercise.findFirst({
      where: { isActive: true },
      select: { slug: true },
    });
    if (!publicExercise) {
      throw new Error(
        'Exercise e2e tests require at least one active exercise.',
      );
    }
    publicExerciseSlug = publicExercise.slug;

    adminEmail = `exercise-e2e-admin-${randomUUID()}@example.test`;
    await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({ name: 'Exercise E2E Admin', email: adminEmail, password })
      .expect(200);

    const admin = await prisma.user.findUniqueOrThrow({
      where: { email: adminEmail },
      select: { id: true },
    });
    adminId = admin.id;
    await prisma.user.update({
      where: { id: adminId },
      data: { role: PlatformRole.ADMIN },
    });
  });

  afterAll(async () => {
    if (createdExerciseId) {
      await prisma.exercise.delete({ where: { id: createdExerciseId } });
    }
    if (adminId) {
      await prisma.user.delete({ where: { id: adminId } });
    }
    if (app) {
      await app.close();
    }
  });

  it('lists and retrieves an active exercise through the public HTTP routes', async () => {
    const list = await request(app.getHttpServer())
      .get('/exercises')
      .expect(200);

    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: publicExerciseSlug }),
      ]),
    );

    const detail = await request(app.getHttpServer())
      .get(`/exercises/${publicExerciseSlug}`)
      .expect(200);

    expect(detail.body).toMatchObject({ slug: publicExerciseSlug });
  });

  it('creates, updates, and archives an exercise through admin HTTP routes', async () => {
    const cookies = await signInAdmin();
    const movementPattern = await prisma.movementPattern.findFirstOrThrow({
      select: { id: true },
    });
    const equipment = await prisma.equipment.findFirstOrThrow({
      select: { id: true },
    });
    const muscle = await prisma.muscle.findFirstOrThrow({
      select: { id: true },
    });
    const slug = `exercise-e2e-${randomUUID()}`;

    const createResponse = await request(app.getHttpServer())
      .post('/admin/exercises')
      .set('Cookie', cookies)
      .send({
        name: `Exercise E2E ${randomUUID()}`,
        slug,
        description: 'An exercise created by the HTTP integration test.',
        instructions: 'Perform the movement with controlled technique.',
        movementPatternId: movementPattern.id,
        forceType: 'PUSH',
        kineticChain: 'OPEN',
        isCompound: false,
        laterality: 'BILATERAL',
        contractionMode: 'DYNAMIC',
        bodyPosition: 'STANDING',
        skillLevel: 'BEGINNER',
        equipmentIds: [equipment.id],
        muscles: [
          { muscleId: muscle.id, role: 'PRIMARY', involvementScore: 3 },
        ],
        capabilities: {
          hypertrophyPotential: 1,
          maximalStrengthPotential: 1,
          powerDevelopmentPotential: 1,
          muscularEndurancePotential: 1,
          stabilityDevelopmentPotential: 1,
          typicalLoadability: 1,
          stretchPositionLoading: 1,
          shortenedPositionLoading: 1,
        },
        demands: {
          technicalDemand: 1,
          setupComplexity: 1,
          stabilityDemand: 1,
          systemicFatiguePotential: 1,
          localFatiguePotential: 1,
          recoveryCostPotential: 1,
          gripDemand: 1,
          axialLoadingPotential: 1,
        },
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      slug,
      message: 'Exercise created successfully',
    });
    createdExerciseId = getBodyString(createResponse.body, 'id');

    await expect(
      prisma.exercise.findUnique({
        where: { id: createdExerciseId },
        select: { slug: true, isActive: true },
      }),
    ).resolves.toEqual({ slug, isActive: true });

    await request(app.getHttpServer())
      .patch(`/admin/exercises/${createdExerciseId}`)
      .set('Cookie', cookies)
      .send({ name: 'Exercise E2E Updated' })
      .expect(200);

    await expect(
      prisma.exercise.findUniqueOrThrow({
        where: { id: createdExerciseId },
        select: { name: true, slug: true },
      }),
    ).resolves.toEqual({ name: 'Exercise E2E Updated', slug });

    const archiveResponse = await request(app.getHttpServer())
      .delete(`/admin/exercises/${createdExerciseId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(archiveResponse.body).toMatchObject({
      id: createdExerciseId,
      message: 'Exercise archived successfully',
    });
    await expect(
      prisma.exercise.findUniqueOrThrow({
        where: { id: createdExerciseId },
        select: { isActive: true, archivedAt: true },
      }),
    ).resolves.toMatchObject({ isActive: false });
  });
});
