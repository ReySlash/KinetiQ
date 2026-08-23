import 'reflect-metadata';

import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/modules/shared/infrastructure/database/prisma/prisma.service';
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
  let muscleSlug: string;
  let emailFetchMock: jest.SpyInstance;

  async function removeExistingPrincipal(email: string): Promise<void> {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!existing) return;

    await prisma.trainingProgram.deleteMany({
      where: { ownerId: existing.id },
    });
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
    process.env.RESEND_API_KEY = 'test-resend-key';
    process.env.RESEND_FROM_EMAIL = 'KinetiQ <test@example.test>';
    emailFetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

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
    if (muscleSlug) {
      await prisma.muscle.deleteMany({ where: { slug: muscleSlug } });
    }
    await removeExistingPrincipal(user.email);
    await removeExistingPrincipal(secondUser.email);
    await removeExistingPrincipal(admin.email);
    emailFetchMock.mockRestore();
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    await app.close();
  });

  it('rejects anonymous routine mutations while allowing global reads', async () => {
    await request(app.getHttpServer())
      .get('/routines?scope=global')
      .expect(200);
    await request(app.getHttpServer())
      .get('/training-programs?scope=global')
      .expect(200);
    await request(app.getHttpServer()).get('/training-programs').expect(401);

    await request(app.getHttpServer())
      .post('/routines')
      .send({ name: 'Anonymous routine', description: null, exercises: [] })
      .expect(401);
    await request(app.getHttpServer())
      .post('/training-programs')
      .send({ name: 'Anonymous program', durationWeeks: 4 })
      .expect(401);
    await request(app.getHttpServer())
      .delete('/training-programs/not-owned')
      .expect(401);
    await request(app.getHttpServer())
      .patch('/routines/not-owned')
      .send({ name: 'Anonymous update' })
      .expect(401);
    await request(app.getHttpServer())
      .delete('/routines/not-owned')
      .expect(401);
    await request(app.getHttpServer())
      .post('/routines/not-owned/duplicate')
      .expect(401);
  });

  it('rejects anonymous administrator mutations', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';

    await request(app.getHttpServer())
      .post('/admin/exercises')
      .send({})
      .expect(401);
    await request(app.getHttpServer())
      .patch(`/admin/exercises/${id}`)
      .send({})
      .expect(401);
    await request(app.getHttpServer())
      .delete(`/admin/exercises/${id}`)
      .expect(401);
    await request(app.getHttpServer())
      .post('/admin/muscles')
      .send({})
      .expect(401);
    await request(app.getHttpServer())
      .patch('/admin/muscles/not-owned')
      .send({})
      .expect(401);
    await request(app.getHttpServer())
      .delete(`/admin/muscles/${id}`)
      .expect(401);
  });

  it('rejects unsafe browser requests from untrusted origins', async () => {
    const userCookies = await signIn(user);

    await request(app.getHttpServer())
      .post('/routines')
      .set('Cookie', userCookies)
      .set('Origin', 'https://evil.example')
      .send({ name: `Blocked routine ${randomUUID()}`, exercises: [] })
      .expect(403);
  });

  it('does not allow ownership or visibility mass assignment', async () => {
    const userCookies = await signIn(user);
    const ownerId = randomUUID();

    await request(app.getHttpServer())
      .post('/routines')
      .set('Cookie', userCookies)
      .send({
        name: `Mass assignment routine ${randomUUID()}`,
        exercises: [],
        ownerId,
        visibility: 'GLOBAL',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', userCookies)
      .send({
        name: `Mass assignment program ${randomUUID()}`,
        durationWeeks: 4,
        ownerId,
        visibility: 'GLOBAL',
      })
      .expect(400);
  });

  it('sends password reset requests through the mocked email provider', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/request-password-reset')
      .send({
        email: user.email,
        redirectTo: 'http://localhost:3001/reset-password',
      })
      .expect(200);

    expect(emailFetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends verification requests through the mocked email provider', async () => {
    const userCookies = await signIn(user);

    await request(app.getHttpServer())
      .post('/api/auth/send-verification-email')
      .set('Cookie', userCookies)
      .send({
        email: user.email,
        callbackURL: 'http://localhost:3001/dashboard',
      })
      .expect(200);

    expect(emailFetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sets secure baseline session cookie attributes', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send({ email: user.email, password })
      .expect(200);
    const cookies = response.headers['set-cookie'];

    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/HttpOnly/i),
        expect.stringMatching(/SameSite=Lax/i),
      ]),
    );
  });

  it('does not allow a client to self-assign the administrator role', async () => {
    const email = `${emailPrefix}-role-tamper-${randomUUID()}@example.test`;

    try {
      await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .send({
          name: 'Role Tampering User',
          email,
          password,
          role: PlatformRole.ADMIN,
        })
        .expect(200);

      await expect(
        prisma.user.findUniqueOrThrow({
          where: { email },
          select: { role: true },
        }),
      ).resolves.toEqual({ role: PlatformRole.USER });
    } finally {
      await removeExistingPrincipal(email);
    }
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

    const secondRoutineName = `Second user HTTP routine ${randomUUID()}`;
    await request(app.getHttpServer())
      .post('/routines')
      .set('Cookie', secondUserCookies)
      .send({ name: secondRoutineName, description: null, exercises: [] })
      .expect(201);

    const ownList = await request(app.getHttpServer())
      .get('/routines?scope=my')
      .set('Cookie', userCookies)
      .expect(200);
    expect(ownList.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: routineName })]),
    );
    expect(ownList.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: secondRoutineName }),
      ]),
    );

    const secondUserList = await request(app.getHttpServer())
      .get('/routines?scope=my')
      .set('Cookie', secondUserCookies)
      .expect(200);
    expect(secondUserList.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: secondRoutineName }),
      ]),
    );
    expect(secondUserList.body).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: routineName })]),
    );

    const crossUserSearch = await request(app.getHttpServer())
      .get(`/routines?scope=my&q=${encodeURIComponent(secondRoutineName)}`)
      .set('Cookie', userCookies)
      .expect(200);
    expect(crossUserSearch.body).toEqual([]);

    const reverseCrossUserSearch = await request(app.getHttpServer())
      .get(`/routines?scope=my&q=${encodeURIComponent(routineName)}`)
      .set('Cookie', secondUserCookies)
      .expect(200);
    expect(reverseCrossUserSearch.body).toEqual([]);

    const privateGlobalSearch = await request(app.getHttpServer())
      .get(`/routines?scope=global&q=${encodeURIComponent(routineName)}`)
      .expect(200);
    expect(privateGlobalSearch.body).toEqual([]);

    await request(app.getHttpServer())
      .get(`/routines/${routineSlug}`)
      .set('Cookie', userCookies)
      .expect(200);

    const privateRoutineResponses = [
      await request(app.getHttpServer())
        .get(`/routines/${routineSlug}`)
        .set('Cookie', secondUserCookies)
        .expect(404),
      await request(app.getHttpServer())
        .patch(`/routines/${routineSlug}`)
        .set('Cookie', secondUserCookies)
        .send({ name: 'Stolen routine', description: null, exercises: [] })
        .expect(404),
      await request(app.getHttpServer())
        .delete(`/routines/${routineSlug}`)
        .set('Cookie', secondUserCookies)
        .expect(404),
      await request(app.getHttpServer())
        .post(`/routines/${routineSlug}/duplicate`)
        .set('Cookie', secondUserCookies)
        .expect(404),
    ];

    await request(app.getHttpServer())
      .get(`/routines/not-a-real-routine-${randomUUID()}`)
      .set('Cookie', userCookies)
      .expect(404);

    await request(app.getHttpServer())
      .get(`/routines/not-a-real-routine-${randomUUID()}`)
      .expect(404);

    const notFoundResponse = {
      status: privateRoutineResponses[0].status,
      body: JSON.stringify(privateRoutineResponses[0].body),
      text: privateRoutineResponses[0].text,
    };
    expect(
      privateRoutineResponses.map(({ status, body, text }) => ({
        status,
        body: JSON.stringify(body),
        text,
      })),
    ).toEqual(privateRoutineResponses.map(() => notFoundResponse));
  });

  it('creates a private training program for the authenticated owner', async () => {
    const userCookies = await signIn(user);
    const name = `Private HTTP program ${randomUUID()}`;
    const routineSlug = `private-http-routine-${randomUUID()}`;
    const globalRoutineSlug = `global-http-routine-${randomUUID()}`;
    await prisma.routine.create({
      data: {
        id: randomUUID(),
        ownerId: user.id,
        slug: routineSlug,
        name: 'Private HTTP routine',
        visibility: 'PRIVATE',
      },
    });
    await prisma.routine.create({
      data: {
        id: randomUUID(),
        ownerId: user.id,
        slug: globalRoutineSlug,
        name: 'Global HTTP routine',
        visibility: 'GLOBAL',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', userCookies)
      .send({
        name,
        description: 'A minimal training program.',
        durationWeeks: 4,
        schedule: [
          { routineSlug, weekNumber: 1, dayNumber: 1, notes: 'Start here' },
          {
            routineSlug: globalRoutineSlug,
            weekNumber: 1,
            dayNumber: 2,
            notes: 'Library movement',
          },
        ],
      })
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Training program created successfully',
    });

    const persisted = await prisma.trainingProgram.findFirstOrThrow({
      where: { name },
      select: {
        slug: true,
        ownerId: true,
        visibility: true,
        name: true,
        routines: {
          select: { weekNumber: true, dayNumber: true, notes: true },
        },
      },
    });
    expect(persisted).toEqual({
      slug: persisted.slug,
      ownerId: user.id,
      visibility: 'PRIVATE',
      name,
      routines: [
        { weekNumber: 1, dayNumber: 1, notes: 'Start here' },
        { weekNumber: 1, dayNumber: 2, notes: 'Library movement' },
      ],
    });

    const detail = await request(app.getHttpServer())
      .get(`/training-programs/${persisted.slug}`)
      .set('Cookie', userCookies)
      .expect(200);

    expect(detail.body).toMatchObject({
      slug: persisted.slug,
      name,
      description: 'A minimal training program.',
      visibility: 'PRIVATE',
      durationWeeks: 4,
      schedule: [
        {
          weekNumber: 1,
          dayNumber: 1,
          notes: 'Start here',
          routine: {
            slug: routineSlug,
            name: 'Private HTTP routine',
            visibility: 'PRIVATE',
          },
        },
        {
          weekNumber: 1,
          dayNumber: 2,
          notes: 'Library movement',
          routine: {
            slug: globalRoutineSlug,
            name: 'Global HTTP routine',
            visibility: 'GLOBAL',
          },
        },
      ],
    });
  });

  it('conceals another user private program behind the same 404', async () => {
    const ownerCookies = await signIn(secondUser);
    const viewerCookies = await signIn(user);
    const name = `Private detail HTTP program ${randomUUID()}`;

    await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', ownerCookies)
      .send({ name, durationWeeks: 4 })
      .expect(201);

    const persisted = await prisma.trainingProgram.findFirstOrThrow({
      where: { name },
      select: { slug: true },
    });
    await request(app.getHttpServer())
      .get(`/training-programs/${persisted.slug}`)
      .set('Cookie', viewerCookies)
      .expect(404);
  });

  it('lists only the authenticated owner private programs', async () => {
    const userCookies = await signIn(user);
    const secondUserCookies = await signIn(secondUser);
    const userProgramName = `Listed HTTP program ${randomUUID()}`;
    const secondUserProgramName = `Hidden HTTP program ${randomUUID()}`;

    await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', userCookies)
      .send({ name: userProgramName, durationWeeks: 4 })
      .expect(201);
    await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', secondUserCookies)
      .send({ name: secondUserProgramName, durationWeeks: 4 })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/training-programs')
      .set('Cookie', userCookies)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: userProgramName }),
      ]),
    );
    expect(response.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: secondUserProgramName }),
      ]),
    );
    expect(response.body).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: user.id })]),
    );
  });

  it('does not disclose whether a scheduled private routine exists', async () => {
    const userCookies = await signIn(user);
    const inaccessibleRoutineSlug = `other-user-routine-${randomUUID()}`;
    const programName = `Invalid HTTP program ${randomUUID()}`;
    await prisma.routine.create({
      data: {
        id: randomUUID(),
        ownerId: secondUser.id,
        slug: inaccessibleRoutineSlug,
        name: 'Other user routine',
        visibility: 'PRIVATE',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', userCookies)
      .send({
        name: programName,
        durationWeeks: 4,
        schedule: [
          {
            routineSlug: inaccessibleRoutineSlug,
            weekNumber: 1,
            dayNumber: 1,
          },
        ],
      })
      .expect(422);

    expect(response.body).toMatchObject({
      message: 'One or more scheduled routines are unavailable.',
    });
    await expect(
      prisma.trainingProgram.findFirst({ where: { name: programName } }),
    ).resolves.toBeNull();
  });

  it('updates an owned private program while preserving omitted fields', async () => {
    const userCookies = await signIn(user);
    const name = `Updatable HTTP program ${randomUUID()}`;
    const routineSlug = `updatable-http-routine-${randomUUID()}`;
    await prisma.routine.create({
      data: {
        id: randomUUID(),
        ownerId: user.id,
        slug: routineSlug,
        name: 'Updatable HTTP routine',
        visibility: 'PRIVATE',
      },
    });

    await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', userCookies)
      .send({
        name,
        description: 'Keep this description.',
        durationWeeks: 4,
        schedule: [{ routineSlug, weekNumber: 1, dayNumber: 1 }],
      })
      .expect(201);

    const created = await prisma.trainingProgram.findFirstOrThrow({
      where: { name },
      select: { slug: true },
    });
    await request(app.getHttpServer())
      .patch(`/training-programs/${created.slug}`)
      .set('Cookie', userCookies)
      .send({ durationWeeks: 6, schedule: [] })
      .expect(200);

    const persisted = await prisma.trainingProgram.findUniqueOrThrow({
      where: { slug: created.slug },
      select: {
        name: true,
        description: true,
        durationWeeks: true,
        routines: true,
      },
    });
    expect(persisted).toMatchObject({
      name,
      description: 'Keep this description.',
      durationWeeks: 6,
      routines: [],
    });
  });

  it('rejects updates to another user’s private program without changing it', async () => {
    const ownerCookies = await signIn(secondUser);
    const userCookies = await signIn(user);
    const name = `Other user update target ${randomUUID()}`;

    await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', ownerCookies)
      .send({ name, durationWeeks: 4 })
      .expect(201);

    const created = await prisma.trainingProgram.findFirstOrThrow({
      where: { name },
      select: { slug: true, durationWeeks: true },
    });
    await request(app.getHttpServer())
      .patch(`/training-programs/${created.slug}`)
      .set('Cookie', userCookies)
      .send({ durationWeeks: 8 })
      .expect(404);

    await expect(
      prisma.trainingProgram.findUniqueOrThrow({
        where: { slug: created.slug },
        select: { durationWeeks: true },
      }),
    ).resolves.toEqual({ durationWeeks: created.durationWeeks });
  });

  it('rejects updates to global training program templates', async () => {
    const userCookies = await signIn(user);
    const slug = `global-update-target-${randomUUID()}`;
    await prisma.trainingProgram.create({
      data: {
        id: randomUUID(),
        ownerId: user.id,
        slug,
        name: `Global update target ${randomUUID()}`,
        visibility: 'GLOBAL',
        durationWeeks: 4,
      },
    });

    await request(app.getHttpServer())
      .patch(`/training-programs/${slug}`)
      .set('Cookie', userCookies)
      .send({ durationWeeks: 8 })
      .expect(404);
  });

  it('rejects unavailable routines during update without changing the program', async () => {
    const userCookies = await signIn(user);
    const name = `Unavailable update target ${randomUUID()}`;
    await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', userCookies)
      .send({ name, durationWeeks: 4 })
      .expect(201);

    const created = await prisma.trainingProgram.findFirstOrThrow({
      where: { name },
      select: { slug: true, durationWeeks: true },
    });
    const response = await request(app.getHttpServer())
      .patch(`/training-programs/${created.slug}`)
      .set('Cookie', userCookies)
      .send({
        schedule: [
          {
            routineSlug: `missing-update-routine-${randomUUID()}`,
            weekNumber: 1,
            dayNumber: 1,
          },
        ],
      })
      .expect(422);

    expect(response.body).toMatchObject({
      message: 'One or more scheduled routines are unavailable.',
    });
    await expect(
      prisma.trainingProgram.findUniqueOrThrow({
        where: { slug: created.slug },
        select: { durationWeeks: true, routines: true },
      }),
    ).resolves.toMatchObject({
      durationWeeks: created.durationWeeks,
      routines: [],
    });
  });

  it('rejects invalid schedule updates before persistence', async () => {
    const userCookies = await signIn(user);
    const routineSlug = `invalid-update-routine-${randomUUID()}`;
    const name = `Invalid update target ${randomUUID()}`;
    await prisma.routine.create({
      data: {
        id: randomUUID(),
        ownerId: user.id,
        slug: routineSlug,
        name: 'Invalid update routine',
        visibility: 'PRIVATE',
      },
    });
    await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', userCookies)
      .send({ name, durationWeeks: 4 })
      .expect(201);

    const created = await prisma.trainingProgram.findFirstOrThrow({
      where: { name },
      select: { slug: true },
    });
    const response = await request(app.getHttpServer())
      .patch(`/training-programs/${created.slug}`)
      .set('Cookie', userCookies)
      .send({
        schedule: [
          { routineSlug, weekNumber: 1, dayNumber: 1 },
          { routineSlug, weekNumber: 1, dayNumber: 1 },
        ],
      })
      .expect(422);

    expect(response.body).toMatchObject({
      message: 'Only one routine can occupy week 1, day 1.',
    });
  });

  it('deletes an owned private program and cascades only its schedule rows', async () => {
    const userCookies = await signIn(user);
    const routineSlug = `delete-http-routine-${randomUUID()}`;
    const name = `Delete HTTP program ${randomUUID()}`;
    const routine = await prisma.routine.create({
      data: {
        id: randomUUID(),
        ownerId: user.id,
        slug: routineSlug,
        name: 'Delete HTTP routine',
        visibility: 'PRIVATE',
      },
    });

    await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', userCookies)
      .send({
        name,
        durationWeeks: 4,
        schedule: [{ routineSlug, weekNumber: 1, dayNumber: 1 }],
      })
      .expect(201);
    const created = await prisma.trainingProgram.findFirstOrThrow({
      where: { name },
      select: { slug: true, id: true },
    });

    const response = await request(app.getHttpServer())
      .delete(`/training-programs/${created.slug}`)
      .set('Cookie', userCookies)
      .expect(200);

    expect(response.body).toEqual({
      message: 'Training program deleted successfully',
      slug: created.slug,
    });
    await expect(
      prisma.trainingProgram.findUnique({ where: { id: created.id } }),
    ).resolves.toBeNull();
    await expect(
      prisma.trainingProgramRoutine.findFirst({
        where: { trainingProgramId: created.id },
      }),
    ).resolves.toBeNull();
    await expect(
      prisma.routine.findUnique({ where: { id: routine.id } }),
    ).resolves.not.toBeNull();
  });

  it('does not allow another user to delete a private program', async () => {
    const ownerCookies = await signIn(secondUser);
    const userCookies = await signIn(user);
    const name = `Protected delete HTTP program ${randomUUID()}`;
    await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', ownerCookies)
      .send({ name, durationWeeks: 4 })
      .expect(201);
    const created = await prisma.trainingProgram.findFirstOrThrow({
      where: { name },
      select: { slug: true },
    });

    await request(app.getHttpServer())
      .delete(`/training-programs/${created.slug}`)
      .set('Cookie', userCookies)
      .expect(404);
    await expect(
      prisma.trainingProgram.findUnique({ where: { slug: created.slug } }),
    ).resolves.not.toBeNull();
  });

  it('does not allow deleting a global training program template', async () => {
    const userCookies = await signIn(user);
    const slug = `global-delete-target-${randomUUID()}`;
    await prisma.trainingProgram.create({
      data: {
        id: randomUUID(),
        ownerId: user.id,
        slug,
        name: `Global delete target ${randomUUID()}`,
        visibility: 'GLOBAL',
        durationWeeks: 4,
      },
    });

    await request(app.getHttpServer())
      .delete(`/training-programs/${slug}`)
      .set('Cookie', userCookies)
      .expect(404);
    await expect(
      prisma.trainingProgram.findUnique({ where: { slug } }),
    ).resolves.not.toBeNull();
  });

  it('rejects duplicate schedule slots before persistence', async () => {
    const userCookies = await signIn(user);
    const programName = `Duplicate slot HTTP program ${randomUUID()}`;

    const response = await request(app.getHttpServer())
      .post('/training-programs')
      .set('Cookie', userCookies)
      .send({
        name: programName,
        durationWeeks: 4,
        schedule: [
          { routineSlug: 'upper-a', weekNumber: 1, dayNumber: 1 },
          { routineSlug: 'lower-a', weekNumber: 1, dayNumber: 1 },
        ],
      })
      .expect(422);

    expect(response.body).toMatchObject({
      message: 'Only one routine can occupy week 1, day 1.',
    });
    await expect(
      prisma.trainingProgram.findFirst({ where: { name: programName } }),
    ).resolves.toBeNull();
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
      .patch(`/admin/exercises/${randomUUID()}`)
      .set('Cookie', userCookies)
      .send({})
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/admin/exercises/${randomUUID()}`)
      .set('Cookie', userCookies)
      .expect(403);
    await request(app.getHttpServer())
      .post('/admin/exercises')
      .set('Cookie', adminCookies)
      .send(payload)
      .expect(201);

    muscleSlug = `http-auth-muscle-${randomUUID()}`;
    const musclePayload = {
      name: `HTTP auth muscle ${randomUUID()}`,
      slug: muscleSlug,
      description: 'A test muscle used to verify administrator authorization.',
      bodyRegion: 'CORE',
    };

    await request(app.getHttpServer())
      .post('/admin/muscles')
      .set('Cookie', userCookies)
      .send(musclePayload)
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/admin/muscles/${muscleSlug}`)
      .set('Cookie', userCookies)
      .send({ description: 'Unauthorized update' })
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/admin/muscles/${randomUUID()}`)
      .set('Cookie', userCookies)
      .expect(403);
    await request(app.getHttpServer())
      .post('/admin/muscles')
      .set('Cookie', adminCookies)
      .send(musclePayload)
      .expect(201);
  });
});
