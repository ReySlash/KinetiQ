import 'reflect-metadata';

import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { PlatformRole } from '../generated/prisma/client';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

type TestPrincipal = {
  id: string;
  email: string;
  password: string;
  role: PlatformRole;
};

const password = 'KinetiQ-test-password-123!';
const emailPrefix = `http-auth-${randomUUID()}`;

function createPrincipal(role: PlatformRole): TestPrincipal {
  return {
    id: randomUUID(),
    email: `${emailPrefix}-${role.toLowerCase()}-${randomUUID()}@example.test`,
    password,
    role,
  };
}

function getSessionUserId(body: unknown): string {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('user' in body) ||
    typeof body.user !== 'object' ||
    body.user === null ||
    !('id' in body.user) ||
    typeof body.user.id !== 'string'
  ) {
    throw new Error('The auth session response did not include a user ID.');
  }

  return body.user.id;
}

describe('HTTP authentication and authorization (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let user: TestPrincipal;
  let secondUser: TestPrincipal;
  let admin: TestPrincipal;
  let exerciseSlug: string;

  async function removeExistingPrincipal(email: string): Promise<void> {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!existing) return;

    await prisma.routine.deleteMany({ where: { ownerId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }

  async function seedPrincipal(principal: TestPrincipal): Promise<void> {
    await removeExistingPrincipal(principal.email);

    await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({
        name:
          principal.role === PlatformRole.ADMIN ? 'Test Admin' : 'Test User',
        email: principal.email,
        password: principal.password,
      })
      .expect(200);

    const createdUser = await prisma.user.findUniqueOrThrow({
      where: { email: principal.email },
      select: { id: true },
    });
    principal.id = createdUser.id;

    if (principal.role === PlatformRole.ADMIN) {
      await prisma.user.update({
        where: { id: principal.id },
        data: { role: PlatformRole.ADMIN },
      });
    }
  }

  async function signIn(principal: TestPrincipal): Promise<string[]> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({
        email: principal.email,
        password: principal.password,
      })
      .expect(200);

    const cookies = response.headers['set-cookie'];
    if (!Array.isArray(cookies) || cookies.length === 0) {
      throw new Error('Sign-in did not return a Better Auth session cookie.');
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

    user = createPrincipal(PlatformRole.USER);
    secondUser = createPrincipal(PlatformRole.USER);
    admin = createPrincipal(PlatformRole.ADMIN);

    await seedPrincipal(user);
    await seedPrincipal(secondUser);
    await seedPrincipal(admin);
  });

  afterAll(async () => {
    if (exerciseSlug) {
      await prisma.exercise.deleteMany({ where: { slug: exerciseSlug } });
    }
    await removeExistingPrincipal(user.email);
    await removeExistingPrincipal(secondUser.email);
    await removeExistingPrincipal(admin.email);
    await app.close();
  });

  it('rejects anonymous routine mutations while allowing global reads', async () => {
    await request(app.getHttpServer())
      .get('/routines?scope=global')
      .expect(200);

    await request(app.getHttpServer())
      .post('/routines')
      .send({ name: 'Anonymous routine', description: null, exercises: [] })
      .expect(401);
  });

  it('allows a user to create and read only their own private routine', async () => {
    const userCookies = await signIn(user);
    const secondUserCookies = await signIn(secondUser);

    const sessionResponse = await request(app.getHttpServer())
      .get('/api/auth/get-session')
      .set('Cookie', userCookies)
      .expect(200);
    const sessionUserId = getSessionUserId(sessionResponse.body);
    const secondSessionResponse = await request(app.getHttpServer())
      .get('/api/auth/get-session')
      .set('Cookie', secondUserCookies)
      .expect(200);
    const secondSessionUserId = getSessionUserId(secondSessionResponse.body);
    expect(secondSessionUserId).not.toBe(sessionUserId);

    const routineName = `Private HTTP routine ${randomUUID()}`;
    await request(app.getHttpServer())
      .post('/routines')
      .set('Cookie', userCookies)
      .send({ name: routineName, description: null, exercises: [] })
      .expect(201);

    const createdRoutine = await prisma.routine.findFirstOrThrow({
      where: { name: routineName },
      select: { slug: true, ownerId: true, owner: { select: { email: true } } },
    });
    expect(createdRoutine.owner.email).toBe(user.email);
    expect(createdRoutine.ownerId).toBe(sessionUserId);
    const routineSlug = createdRoutine.slug;

    await request(app.getHttpServer())
      .get(`/routines/${routineSlug}`)
      .set('Cookie', userCookies)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/routines/${routineSlug}`)
      .set('Cookie', secondUserCookies)
      .expect(404);
    await request(app.getHttpServer())
      .patch(`/routines/${routineSlug}`)
      .set('Cookie', secondUserCookies)
      .send({ name: 'Stolen routine', description: null, exercises: [] })
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/routines/${routineSlug}`)
      .set('Cookie', secondUserCookies)
      .expect(404);
    await request(app.getHttpServer())
      .post(`/routines/${routineSlug}/duplicate`)
      .set('Cookie', secondUserCookies)
      .expect(404);
  });

  it('allows an admin session to use admin routes and rejects a regular user', async () => {
    const userCookies = await signIn(user);
    const adminCookies = await signIn(admin);
    exerciseSlug = `http-auth-exercise-${randomUUID()}`;

    const payload = {
      name: `HTTP auth exercise ${randomUUID()}`,
      slug: exerciseSlug,
      description:
        'A test exercise used to verify administrator authorization.',
      instructions: 'Perform the movement with controlled technique and range.',
      movementPatternId: (await prisma.movementPattern.findFirstOrThrow()).id,
      forceType: 'PUSH',
      kineticChain: 'OPEN',
      isCompound: false,
      laterality: 'BILATERAL',
      contractionMode: 'DYNAMIC',
      bodyPosition: 'STANDING',
      skillLevel: 'BEGINNER',
      equipmentIds: [(await prisma.equipment.findFirstOrThrow()).id],
      muscles: [
        {
          muscleId: (await prisma.muscle.findFirstOrThrow()).id,
          role: 'PRIMARY',
          involvementScore: 3,
        },
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
    };

    await request(app.getHttpServer())
      .post('/admin/exercises')
      .set('Cookie', userCookies)
      .send(payload)
      .expect(403);
    await request(app.getHttpServer())
      .post('/admin/exercises')
      .set('Cookie', adminCookies)
      .send(payload)
      .expect(201);
  });
});
