import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Pool } from 'pg';
import { WorkoutSessionConcurrencyError } from '../src/modules/workout-sessions/application/errors/workout-session.application.errors';
import { WorkoutSession } from '../src/modules/workout-sessions/domain/entities/workout-session.entity';
import { PrismaWorkoutSessionsAdapter } from '../src/modules/workout-sessions/infrastructure/prisma/prisma-workout-sessions.adapter';
import { PrismaService } from '../src/modules/shared/infrastructure/database/prisma/prisma.service';

type ProgramWorkoutFixture = {
  ownerId: string;
  programId: string;
  occurrenceId: string;
  sessionId: string;
};

describe('workout-session adopted-program propagation (e2e)', () => {
  let pool: Pool;
  let module: TestingModule;
  let adapter: PrismaWorkoutSessionsAdapter;
  let exerciseId: string;
  const ownerIds = new Set<string>();

  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required for persistence e2e tests.');
    }
    pool = new Pool({ connectionString: databaseUrl });
    const exercise = await pool.query<{ id: string }>(
      'SELECT "id" FROM "Exercise" ORDER BY "id" LIMIT 1',
    );
    const seededExercise = exercise.rows[0];
    if (!seededExercise) {
      throw new Error('The test database must contain an exercise.');
    }
    exerciseId = seededExercise.id;

    module = await Test.createTestingModule({
      providers: [
        PrismaWorkoutSessionsAdapter,
        PrismaService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => databaseUrl },
        },
      ],
    }).compile();
    await module.init();
    adapter = module.get(PrismaWorkoutSessionsAdapter);
  });

  afterEach(async () => {
    for (const ownerId of ownerIds) {
      await pool.query(
        'DELETE FROM "WorkoutSession" WHERE "ownerId" = $1::uuid',
        [ownerId],
      );
      await pool.query(
        `DELETE FROM "ProgramWorkoutOccurrence"
         WHERE "adoptedTrainingProgramId" IN (
           SELECT "id" FROM "AdoptedTrainingProgram"
           WHERE "ownerId" = $1::uuid
         )`,
        [ownerId],
      );
      await pool.query(
        'DELETE FROM "AdoptedTrainingProgram" WHERE "ownerId" = $1::uuid',
        [ownerId],
      );
      await pool.query('DELETE FROM "user" WHERE "id" = $1::uuid', [ownerId]);
    }
    ownerIds.clear();
  });

  afterAll(async () => {
    await module?.close();
    await pool?.end();
  });

  async function createFixture(
    includePendingOccurrence = false,
  ): Promise<ProgramWorkoutFixture> {
    const ownerId = randomUUID();
    const programId = randomUUID();
    const occurrenceId = randomUUID();
    const sessionId = randomUUID();
    const performanceId = randomUUID();
    const startedAt = new Date(Date.now() - 10_000);
    const setCompletedAt = new Date(Date.now() - 5_000);
    ownerIds.add(ownerId);

    await pool.query(
      `INSERT INTO "user" ("id", "name", "email", "updatedAt")
       VALUES ($1::uuid, $2, $3, NOW())`,
      [ownerId, 'Program Propagation User', `${ownerId}@example.test`],
    );
    await pool.query(
      `INSERT INTO "AdoptedTrainingProgram"
        ("id", "ownerId", "programNameSnapshot", "durationWeeksSnapshot",
         "startedAt", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, 1, $4, $4, $4)`,
      [programId, ownerId, 'Propagation Program', startedAt],
    );
    await pool.query(
      `INSERT INTO "ProgramWorkoutOccurrence"
        ("id", "adoptedTrainingProgramId", "weekNumber", "dayNumber",
         "routineNameSnapshot", "status", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, 1, 1, $3, 'IN_PROGRESS', $4, $4)`,
      [occurrenceId, programId, 'Propagation Workout', startedAt],
    );
    if (includePendingOccurrence) {
      await pool.query(
        `INSERT INTO "ProgramWorkoutOccurrence"
          ("id", "adoptedTrainingProgramId", "weekNumber", "dayNumber",
           "routineNameSnapshot", "status", "createdAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, 1, 2, $3, 'PENDING', $4, $4)`,
        [randomUUID(), programId, 'Next Workout', startedAt],
      );
    }
    await pool.query(
      `INSERT INTO "WorkoutSession"
        ("id", "ownerId", "programWorkoutOccurrenceId", "status", "timezone",
         "startedAt", "createdAt", "updatedAt", "version")
       VALUES ($1::uuid, $2::uuid, $3::uuid, 'IN_PROGRESS', 'UTC', $4, $4, $4, 0)`,
      [sessionId, ownerId, occurrenceId, startedAt],
    );
    await pool.query(
      `INSERT INTO "ExercisePerformance"
        ("id", "workoutSessionId", "exerciseId", "order",
         "exerciseNameSnapshot", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3::uuid, 0, $4, $5, $5)`,
      [performanceId, sessionId, exerciseId, 'Bench Press', startedAt],
    );
    await pool.query(
      `INSERT INTO "CompletedSet"
        ("id", "exercisePerformanceId", "order", "repetitions", "loadKg",
         "loadUnit", "completedAt", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, 0, 8, 100, 'KG', $3, $3, $3)`,
      [randomUUID(), performanceId, setCompletedAt],
    );
    return { ownerId, programId, occurrenceId, sessionId };
  }

  async function loadWorkout(
    fixture: ProgramWorkoutFixture,
  ): Promise<WorkoutSession> {
    const value = await adapter.findOwnedById({
      ownerId: fixture.ownerId,
      workoutSessionId: fixture.sessionId,
    });
    if (!value) throw new Error('Expected the fixture workout session.');
    return WorkoutSession.reconstitute(value);
  }

  it('completes the session, final occurrence, and parent atomically', async () => {
    const fixture = await createFixture();
    const workout = await loadWorkout(fixture);
    const completed = workout.complete(new Date());

    await adapter.complete(completed, workout.version);

    const result = await pool.query<{
      sessionStatus: string;
      occurrenceStatus: string;
      programStatus: string;
      version: number;
    }>(
      `SELECT session."status"::text AS "sessionStatus",
              occurrence."status"::text AS "occurrenceStatus",
              program."status"::text AS "programStatus",
              session."version"
       FROM "WorkoutSession" AS session
       JOIN "ProgramWorkoutOccurrence" AS occurrence
         ON occurrence."id" = session."programWorkoutOccurrenceId"
       JOIN "AdoptedTrainingProgram" AS program
         ON program."id" = occurrence."adoptedTrainingProgramId"
       WHERE session."id" = $1::uuid`,
      [fixture.sessionId],
    );
    expect(result.rows[0]).toEqual({
      sessionStatus: 'COMPLETED',
      occurrenceStatus: 'COMPLETED',
      programStatus: 'COMPLETED',
      version: 1,
    });
  });

  it('preserves a cancelled attempt and returns its occurrence to pending', async () => {
    const fixture = await createFixture();
    const workout = await loadWorkout(fixture);
    const cancelled = workout.cancel(new Date());

    await adapter.cancel(cancelled, workout.version);

    const result = await pool.query<{
      sessionStatus: string;
      occurrenceStatus: string;
      programStatus: string;
      linkedOccurrenceId: string;
      completedSets: string;
    }>(
      `SELECT session."status"::text AS "sessionStatus",
              occurrence."status"::text AS "occurrenceStatus",
              program."status"::text AS "programStatus",
              session."programWorkoutOccurrenceId" AS "linkedOccurrenceId",
              COUNT(completed_set."id")::text AS "completedSets"
       FROM "WorkoutSession" AS session
       JOIN "ProgramWorkoutOccurrence" AS occurrence
         ON occurrence."id" = session."programWorkoutOccurrenceId"
       JOIN "AdoptedTrainingProgram" AS program
         ON program."id" = occurrence."adoptedTrainingProgramId"
       LEFT JOIN "ExercisePerformance" AS performance
         ON performance."workoutSessionId" = session."id"
       LEFT JOIN "CompletedSet" AS completed_set
         ON completed_set."exercisePerformanceId" = performance."id"
       WHERE session."id" = $1::uuid
       GROUP BY session."id", occurrence."id", program."id"`,
      [fixture.sessionId],
    );
    expect(result.rows[0]).toEqual({
      sessionStatus: 'CANCELLED',
      occurrenceStatus: 'PENDING',
      programStatus: 'ACTIVE',
      linkedOccurrenceId: fixture.occurrenceId,
      completedSets: '1',
    });
  });

  it('keeps the parent active while another occurrence remains pending', async () => {
    const fixture = await createFixture(true);
    const workout = await loadWorkout(fixture);

    await adapter.complete(workout.complete(new Date()), workout.version);

    const result = await pool.query<{
      occurrenceStatus: string;
      programStatus: string;
    }>(
      `SELECT occurrence."status"::text AS "occurrenceStatus",
              program."status"::text AS "programStatus"
       FROM "ProgramWorkoutOccurrence" AS occurrence
       JOIN "AdoptedTrainingProgram" AS program
         ON program."id" = occurrence."adoptedTrainingProgramId"
       WHERE occurrence."id" = $1::uuid`,
      [fixture.occurrenceId],
    );
    expect(result.rows[0]).toEqual({
      occurrenceStatus: 'COMPLETED',
      programStatus: 'ACTIVE',
    });
  });

  it('allows only one concurrent completion without partial state', async () => {
    const fixture = await createFixture();
    const workout = await loadWorkout(fixture);
    const completed = workout.complete(new Date());

    const results = await Promise.allSettled([
      adapter.complete(completed, workout.version),
      adapter.complete(completed, workout.version),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = results.find((result) => result.status === 'rejected');
    expect(rejected?.status).toBe('rejected');
    if (rejected?.status === 'rejected') {
      expect(rejected.reason).toBeInstanceOf(WorkoutSessionConcurrencyError);
    }
    const persisted = await pool.query<{
      sessionStatus: string;
      occurrenceStatus: string;
      programStatus: string;
      version: number;
    }>(
      `SELECT session."status"::text AS "sessionStatus",
              occurrence."status"::text AS "occurrenceStatus",
              program."status"::text AS "programStatus",
              session."version"
       FROM "WorkoutSession" AS session
       JOIN "ProgramWorkoutOccurrence" AS occurrence
         ON occurrence."id" = session."programWorkoutOccurrenceId"
       JOIN "AdoptedTrainingProgram" AS program
         ON program."id" = occurrence."adoptedTrainingProgramId"
       WHERE session."id" = $1::uuid`,
      [fixture.sessionId],
    );
    expect(persisted.rows[0]).toEqual({
      sessionStatus: 'COMPLETED',
      occurrenceStatus: 'COMPLETED',
      programStatus: 'COMPLETED',
      version: 1,
    });
  });
});
