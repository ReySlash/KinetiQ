import 'reflect-metadata';

import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/modules/shared/infrastructure/database/prisma/prisma.service';
import { apiRequest as request, createE2eApp } from './create-e2e-app';
import type { App } from 'supertest/types';

type Principal = { email: string; password: string; id?: string };

const password = 'KinetiQ-adopted-journey-password-123!';

function principal(): Principal {
  return { email: `adopted-journey-${randomUUID()}@example.test`, password };
}

function cookies(response: { headers: { 'set-cookie'?: string[] } }): string[] {
  if (!response.headers['set-cookie']?.length) {
    throw new Error('Sign-in did not return a session cookie.');
  }
  return response.headers['set-cookie'];
}

function id(body: unknown): string {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('id' in body) ||
    typeof body.id !== 'string'
  ) {
    throw new Error('Response did not include an ID.');
  }
  return body.id;
}

type AdoptedProgramDetail = {
  status: string;
  occurrences: Array<{
    id: string;
    status: string;
    sessionAttemptIds: string[];
  }>;
  nextPendingOccurrence: { id: string } | null;
};

type WorkoutSessionDetail = {
  performances: Array<{ id: string }>;
};

type StartResponse = { workoutSessionId: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function record(body: unknown): Record<string, unknown> {
  if (!isRecord(body)) {
    throw new Error('Expected an object response.');
  }
  return body;
}

function stringField(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== 'string') {
    throw new Error(`Response field ${field} was not a string.`);
  }
  return value;
}

function createdResource(body: unknown): { slug: string } {
  return { slug: stringField(record(body), 'slug') };
}

function startResponse(body: unknown): StartResponse {
  return { workoutSessionId: stringField(record(body), 'workoutSessionId') };
}

function adoptedProgramDetail(body: unknown): AdoptedProgramDetail {
  const value = record(body);
  const occurrences = value.occurrences;
  if (!Array.isArray(occurrences)) {
    throw new Error('Adopted program response did not include occurrences.');
  }
  const parsedOccurrences = occurrences.map((occurrence) => {
    const item = record(occurrence);
    const sessionAttemptIds = item.sessionAttemptIds;
    if (
      !Array.isArray(sessionAttemptIds) ||
      !sessionAttemptIds.every((attemptId) => typeof attemptId === 'string')
    ) {
      throw new Error('Occurrence response did not include session attempts.');
    }
    return {
      id: stringField(item, 'id'),
      status: stringField(item, 'status'),
      sessionAttemptIds,
    };
  });
  const next = value.nextPendingOccurrence;
  return {
    status: stringField(value, 'status'),
    occurrences: parsedOccurrences,
    nextPendingOccurrence:
      next === null ? null : { id: stringField(record(next), 'id') },
  };
}

function workoutSessionDetail(body: unknown): WorkoutSessionDetail {
  const performances = record(body).performances;
  if (!Array.isArray(performances)) {
    throw new Error('Workout session response did not include performances.');
  }
  return {
    performances: performances.map((performance) => ({
      id: stringField(record(performance), 'id'),
    })),
  };
}

describe('adopted training program HTTP journeys (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const users: Principal[] = [];
  const routineSlugs: string[] = [];
  const programSlugs: string[] = [];

  async function signUp(user: Principal): Promise<string[]> {
    await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({ name: 'Adopted Journey User', ...user })
      .expect(200);
    user.id = (
      await prisma.user.findUniqueOrThrow({
        where: { email: user.email },
        select: { id: true },
      })
    ).id;
    return cookies(
      await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .send({ email: user.email, password: user.password })
        .expect(200),
    );
  }

  async function createRoutine(userCookies: string[], slug: string) {
    const exercise = await prisma.exercise.findFirstOrThrow({
      where: { isActive: true },
      select: { slug: true },
    });
    const response = await request(app.getHttpServer())
      .post('/api/routines')
      .set('Cookie', userCookies)
      .send({
        name: `Journey Routine ${slug.slice(-8)}`,
        exercises: [
          {
            exerciseSlug: exercise.slug,
            sets: 2,
            minReps: 8,
            maxReps: 10,
            targetRir: 2,
            restSeconds: 90,
          },
        ],
      })
      .expect(201);
    const createdSlug = createdResource(response.body).slug;
    routineSlugs.push(createdSlug);
    return createdSlug;
  }

  async function createProgram(
    userCookies: string[],
    routineSlug: string,
    durationWeeks: number,
  ): Promise<string> {
    const slug = `journey-program-${randomUUID()}`;
    const response = await request(app.getHttpServer())
      .post('/api/training-programs')
      .set('Cookie', userCookies)
      .send({
        name: `Journey Program ${slug.slice(-8)}`,
        slug,
        durationWeeks,
        schedule: Array.from({ length: durationWeeks }, (_, index) => ({
          routineSlug,
          weekNumber: index + 1,
          dayNumber: 1,
        })),
      })
      .expect(201);
    const createdProgram = createdResource(response.body);
    programSlugs.push(createdProgram.slug);
    return createdProgram.slug;
  }

  beforeAll(async () => {
    process.env.RESEND_API_KEY = 'test-resend-key';
    process.env.RESEND_FROM_EMAIL = 'KinetiQ <test@example.test>';
    app = await createE2eApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    for (const user of users) {
      const record = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true },
      });
      if (!record) continue;
      await prisma.workoutSession.deleteMany({ where: { ownerId: record.id } });
      await prisma.programWorkoutOccurrence.deleteMany({
        where: { adoptedTrainingProgram: { ownerId: record.id } },
      });
      await prisma.adoptedTrainingProgram.deleteMany({
        where: { ownerId: record.id },
      });
      await prisma.trainingProgram.deleteMany({
        where: { ownerId: record.id },
      });
      await prisma.routine.deleteMany({ where: { ownerId: record.id } });
      await prisma.session.deleteMany({ where: { userId: record.id } });
      await prisma.account.deleteMany({ where: { userId: record.id } });
      await prisma.user.delete({ where: { id: record.id } });
    }
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    await app.close();
  });

  it('adopts, starts, records, completes, skips the final occurrence, and completes the parent', async () => {
    const user = principal();
    users.push(user);
    const userCookies = await signUp(user);
    const routineSlug = await createRoutine(
      userCookies,
      `journey-routine-${randomUUID()}`,
    );
    const programSlug = await createProgram(userCookies, routineSlug, 2);

    const adopted = await request(app.getHttpServer())
      .post('/api/user-training-programs')
      .set('Cookie', userCookies)
      .send({ sourceProgramSlug: programSlug })
      .expect(201);
    const programId = id(adopted.body);
    const active = await request(app.getHttpServer())
      .get('/api/user-training-programs/active')
      .set('Cookie', userCookies)
      .expect(200);
    const activeProgram = adoptedProgramDetail(active.body);
    const firstOccurrence = activeProgram.occurrences[0]?.id;
    if (!firstOccurrence) throw new Error('First occurrence was not returned.');

    const started = await request(app.getHttpServer())
      .post(
        `/api/user-training-programs/${programId}/workouts/${firstOccurrence}/start`,
      )
      .set('Cookie', userCookies)
      .send({ timezone: 'UTC' })
      .expect(201);
    const sessionId = startResponse(started.body).workoutSessionId;
    const session = await request(app.getHttpServer())
      .get(`/api/workout-sessions/${sessionId}`)
      .set('Cookie', userCookies)
      .expect(200);
    const performanceId = workoutSessionDetail(session.body).performances[0]
      ?.id;
    if (!performanceId) throw new Error('Performance was not returned.');

    await request(app.getHttpServer())
      .post(
        `/api/workout-sessions/${sessionId}/exercises/${performanceId}/sets`,
      )
      .set('Cookie', userCookies)
      .send({ repetitions: 8, load: '50', loadUnit: 'KG', isWarmup: false })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/workout-sessions/${sessionId}/complete`)
      .set('Cookie', userCookies)
      .send({})
      .expect(200);

    const afterCompletion = await request(app.getHttpServer())
      .get(`/api/user-training-programs/${programId}`)
      .set('Cookie', userCookies)
      .expect(200);
    const completedFirst = adoptedProgramDetail(afterCompletion.body);
    expect(completedFirst.occurrences[0]?.status).toBe('COMPLETED');
    expect(completedFirst.nextPendingOccurrence).not.toBeNull();

    const finalOccurrence = completedFirst.nextPendingOccurrence?.id;
    if (!finalOccurrence) throw new Error('Final occurrence was not returned.');
    await request(app.getHttpServer())
      .post(
        `/api/user-training-programs/${programId}/workouts/${finalOccurrence}/skip`,
      )
      .set('Cookie', userCookies)
      .expect(200);
    const completedProgram = await request(app.getHttpServer())
      .get(`/api/user-training-programs/${programId}`)
      .set('Cookie', userCookies)
      .expect(200);
    const completed = adoptedProgramDetail(completedProgram.body);
    expect(completed.status).toBe('COMPLETED');
    expect(completed.occurrences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: 'COMPLETED' }),
        expect.objectContaining({ status: 'SKIPPED' }),
      ]),
    );
  });

  it('preserves a cancelled attempt, returns the occurrence to pending, and permits retry', async () => {
    const user = principal();
    users.push(user);
    const userCookies = await signUp(user);
    const routineSlug = await createRoutine(
      userCookies,
      `retry-routine-${randomUUID()}`,
    );
    const programSlug = await createProgram(userCookies, routineSlug, 1);
    const adopted = await request(app.getHttpServer())
      .post('/api/user-training-programs')
      .set('Cookie', userCookies)
      .send({ sourceProgramSlug: programSlug })
      .expect(201);
    const programId = id(adopted.body);
    const active = await request(app.getHttpServer())
      .get('/api/user-training-programs/active')
      .set('Cookie', userCookies)
      .expect(200);
    const activeProgram = adoptedProgramDetail(active.body);
    const occurrenceId = activeProgram.occurrences[0]?.id;
    if (!occurrenceId) throw new Error('Occurrence was not returned.');

    const firstStart = await request(app.getHttpServer())
      .post(
        `/api/user-training-programs/${programId}/workouts/${occurrenceId}/start`,
      )
      .set('Cookie', userCookies)
      .send({ timezone: 'UTC' })
      .expect(201);
    const cancelledSessionId = startResponse(firstStart.body).workoutSessionId;
    await request(app.getHttpServer())
      .post(`/api/workout-sessions/${cancelledSessionId}/cancel`)
      .set('Cookie', userCookies)
      .send({})
      .expect(200);

    const afterCancel = await request(app.getHttpServer())
      .get(`/api/user-training-programs/${programId}`)
      .set('Cookie', userCookies)
      .expect(200);
    const cancelledProgram = adoptedProgramDetail(afterCancel.body);
    expect(cancelledProgram.occurrences[0]?.status).toBe('PENDING');
    expect(cancelledProgram.occurrences[0]?.sessionAttemptIds).toContain(
      cancelledSessionId,
    );

    const history = await request(app.getHttpServer())
      .get('/api/workout-sessions?status=CANCELLED')
      .set('Cookie', userCookies)
      .expect(200);
    expect(history.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: cancelledSessionId }),
      ]),
    );

    const retry = await request(app.getHttpServer())
      .post(
        `/api/user-training-programs/${programId}/workouts/${occurrenceId}/start`,
      )
      .set('Cookie', userCookies)
      .send({ timezone: 'UTC' })
      .expect(201);
    expect(startResponse(retry.body).workoutSessionId).not.toBe(
      cancelledSessionId,
    );
  });
});
