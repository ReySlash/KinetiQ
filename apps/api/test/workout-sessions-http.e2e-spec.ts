import 'reflect-metadata';

import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { PlatformRole } from '../generated/prisma/client';
import { PrismaService } from '../src/modules/shared/infrastructure/database/prisma/prisma.service';
import { apiRequest as request, createE2eApp } from './create-e2e-app';
import type { App } from 'supertest/types';

type TestPrincipal = {
  email: string;
  password: string;
  id?: string;
};

const password = 'KinetiQ-workout-e2e-password-123!';

function createPrincipal(): TestPrincipal {
  return {
    email: `workout-http-${randomUUID()}@example.test`,
    password,
  };
}

function getCookies(response: {
  headers: { 'set-cookie'?: string[] | string };
}): string[] {
  const cookies = response.headers['set-cookie'];
  if (!Array.isArray(cookies) || cookies.length === 0) {
    throw new Error('Authentication response did not return a session cookie.');
  }
  return cookies;
}

function getResponseId(body: unknown): string {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('id' in body) ||
    typeof body.id !== 'string'
  ) {
    throw new Error('Workout response did not include an ID.');
  }
  return body.id;
}

describe('Workout sessions HTTP authorization and concurrency (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const principals: TestPrincipal[] = [];

  async function removePrincipal(principal: TestPrincipal): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: principal.email },
      select: { id: true },
    });
    if (!user) return;

    await prisma.workoutSession.deleteMany({ where: { ownerId: user.id } });
    await prisma.trainingProgram.deleteMany({ where: { ownerId: user.id } });
    await prisma.routine.deleteMany({ where: { ownerId: user.id } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.account.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }

  async function signUp(principal: TestPrincipal): Promise<void> {
    await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({
        name: 'Workout E2E User',
        email: principal.email,
        password: principal.password,
      })
      .expect(200);

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: principal.email },
      select: { id: true, role: true },
    });
    expect(user.role).toBe(PlatformRole.USER);
    principal.id = user.id;
  }

  async function signIn(principal: TestPrincipal): Promise<string[]> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({ email: principal.email, password: principal.password })
      .expect(200);

    return getCookies(response);
  }

  beforeAll(async () => {
    process.env.RESEND_API_KEY = 'test-resend-key';
    process.env.RESEND_FROM_EMAIL = 'KinetiQ <test@example.test>';

    app = await createE2eApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    for (const principal of principals) await removePrincipal(principal);
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    await app.close();
  });

  it('resolves the authenticated principal and persists that owner on start', async () => {
    const principal = createPrincipal();
    principals.push(principal);
    await signUp(principal);
    const cookies = await signIn(principal);

    const response = await request(app.getHttpServer())
      .post('/api/workout-sessions')
      .set('Cookie', cookies)
      .send({ timezone: 'Asia/Qatar' })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({ status: 'IN_PROGRESS', version: 0 }),
    );

    const workoutSessionId = getResponseId(response.body);
    const persisted = await prisma.workoutSession.findUniqueOrThrow({
      where: { id: workoutSessionId },
      select: { id: true, ownerId: true, status: true, timezone: true },
    });
    expect(persisted).toEqual({
      id: workoutSessionId,
      ownerId: principal.id,
      status: 'IN_PROGRESS',
      timezone: 'Asia/Qatar',
    });
  });

  it('isolates workout history and detail reads between authenticated users', async () => {
    const owner = createPrincipal();
    const otherUser = createPrincipal();
    principals.push(owner, otherUser);
    await signUp(owner);
    await signUp(otherUser);
    const ownerCookies = await signIn(owner);
    const otherUserCookies = await signIn(otherUser);

    const created = await request(app.getHttpServer())
      .post('/api/workout-sessions')
      .set('Cookie', ownerCookies)
      .send({ timezone: 'Asia/Qatar' })
      .expect(201);
    const workoutSessionId = getResponseId(created.body);

    await request(app.getHttpServer())
      .get(`/api/workout-sessions/${workoutSessionId}`)
      .set('Cookie', ownerCookies)
      .expect(200)
      .expect((response) => {
        expect(getResponseId(response.body)).toBe(workoutSessionId);
      });

    await request(app.getHttpServer())
      .get(`/api/workout-sessions/${workoutSessionId}`)
      .set('Cookie', otherUserCookies)
      .expect(404);

    const otherHistory = await request(app.getHttpServer())
      .get('/api/workout-sessions')
      .set('Cookie', otherUserCookies)
      .expect(200);
    expect(otherHistory.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: workoutSessionId }),
      ]),
    );

    const otherActive = await request(app.getHttpServer())
      .get('/api/workout-sessions/active')
      .set('Cookie', otherUserCookies)
      .expect(200);
    expect(otherActive.text).toBe('');
  });

  it('searches history by routine name while preserving owner isolation', async () => {
    const owner = createPrincipal();
    const otherUser = createPrincipal();
    principals.push(owner, otherUser);
    await signUp(owner);
    await signUp(otherUser);
    const ownerCookies = await signIn(owner);
    const otherUserCookies = await signIn(otherUser);

    const matchingId = randomUUID();
    const ownerNonMatchingId = randomUUID();
    const otherUserMatchingId = randomUUID();
    const startedAt = new Date('2026-08-20T10:00:00.000Z');
    await prisma.workoutSession.createMany({
      data: [
        {
          id: matchingId,
          ownerId: owner.id!,
          sourceRoutineNameSnapshot: 'Upper Body Strength',
          status: 'COMPLETED',
          timezone: 'Asia/Qatar',
          startedAt,
          completedAt: startedAt,
        },
        {
          id: ownerNonMatchingId,
          ownerId: owner.id!,
          sourceRoutineNameSnapshot: 'Lower Body Strength',
          status: 'COMPLETED',
          timezone: 'Asia/Qatar',
          startedAt,
          completedAt: startedAt,
        },
        {
          id: otherUserMatchingId,
          ownerId: otherUser.id!,
          sourceRoutineNameSnapshot: 'Upper Body Strength',
          status: 'COMPLETED',
          timezone: 'Asia/Qatar',
          startedAt,
          completedAt: startedAt,
        },
      ],
    });

    const ownerHistory = await request(app.getHttpServer())
      .get('/api/workout-sessions?q=%20UPPER%20')
      .set('Cookie', ownerCookies)
      .expect(200);

    expect(ownerHistory.body).toEqual([
      expect.objectContaining({
        id: matchingId,
        sourceRoutineNameSnapshot: 'Upper Body Strength',
      }),
    ]);

    const otherUserHistory = await request(app.getHttpServer())
      .get('/api/workout-sessions?q=upper')
      .set('Cookie', otherUserCookies)
      .expect(200);

    expect(otherUserHistory.body).toEqual([
      expect.objectContaining({
        id: otherUserMatchingId,
        sourceRoutineNameSnapshot: 'Upper Body Strength',
      }),
    ]);
  });

  it('allows exactly one concurrent active start through the PostgreSQL partial unique index', async () => {
    const principal = createPrincipal();
    principals.push(principal);
    await signUp(principal);
    const cookies = await signIn(principal);

    const index = await prisma.$queryRaw<
      Array<{ indisunique: boolean; predicate: string | null }>
    >`
      SELECT indexMeta.indisunique,
             pg_get_expr(indexMeta.indpred, indexMeta.indrelid) AS predicate
      FROM pg_index AS indexMeta
      JOIN pg_class AS indexClass ON indexClass.oid = indexMeta.indexrelid
      WHERE indexClass.relname = 'WorkoutSession_one_in_progress_per_owner_idx'
    `;
    expect(index).toHaveLength(1);
    expect(index[0]?.indisunique).toBe(true);
    expect(index[0]?.predicate).toEqual(expect.any(String));
    expect(index[0]?.predicate).toMatch(/status.*IN_PROGRESS/i);

    const results = await Promise.all(
      [0, 1].map(() =>
        request(app.getHttpServer())
          .post('/api/workout-sessions')
          .set('Cookie', cookies)
          .send({ timezone: 'Asia/Qatar' }),
      ),
    );

    expect(results.map((result) => result.status).sort()).toEqual([201, 409]);

    const activeSessions = await prisma.workoutSession.findMany({
      where: { ownerId: principal.id, status: 'IN_PROGRESS' },
      select: { id: true },
    });
    expect(activeSessions).toHaveLength(1);
  });
});
