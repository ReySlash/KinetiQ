import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Pool } from 'pg';
import { PrismaService } from '../src/modules/shared/infrastructure/database/prisma/prisma.service';
import { AdoptedTrainingProgram } from '../src/modules/adopted-training-programs/domain/adopted-training-program.aggregate';
import { AdoptedTrainingProgramConcurrencyError } from '../src/modules/adopted-training-programs/application/errors/adopted-training-program.errors';
import { PrismaAdoptedTrainingProgramsAdapter } from '../src/modules/adopted-training-programs/infrastructure/prisma/prisma-adopted-training-programs.adapter';

function normalizePredicate(predicate: string | undefined): string {
  return (predicate ?? '')
    .replace(/["']/g, '')
    .replace(/::[a-z0-9_]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\((.*)\)$/, '$1')
    .toUpperCase();
}

describe('adopted training program Prisma adapter (e2e)', () => {
  let pool: Pool;
  let module: TestingModule;
  let adapter: PrismaAdoptedTrainingProgramsAdapter;

  const ownerId = randomUUID();
  const otherOwnerId = randomUUID();
  const otherRoutineId = randomUUID();
  const otherRoutineExerciseId = randomUUID();
  const otherProgramId = randomUUID();
  const otherOccurrenceId = randomUUID();
  const otherOccurrenceTwoId = randomUUID();
  const programId = randomUUID();
  const occurrenceId = randomUUID();
  const routineId = randomUUID();
  const routineExerciseId = randomUUID();

  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required for persistence e2e tests.');
    }

    pool = new Pool({ connectionString: databaseUrl });
    const exercise = await pool.query<{ id: string; slug: string }>(
      'SELECT "id", "slug" FROM "Exercise" ORDER BY "id" LIMIT 1',
    );
    const seededExercise = exercise.rows[0];
    if (!seededExercise) {
      throw new Error('The test database must contain an exercise.');
    }

    await pool.query(
      `INSERT INTO "user" ("id", "name", "email", "updatedAt")
       VALUES ($1::uuid, $2, $3, NOW())`,
      [ownerId, 'Adapter Race Test User', `${ownerId}@example.test`],
    );
    await pool.query(
      `INSERT INTO "user" ("id", "name", "email", "updatedAt")
       VALUES ($1::uuid, $2, $3, NOW())`,
      [
        otherOwnerId,
        'Adapter Isolation Test User',
        `${otherOwnerId}@example.test`,
      ],
    );
    await pool.query(
      `INSERT INTO "Routine"
        ("id", "ownerId", "slug", "name", "visibility", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, $4, 'PRIVATE', NOW(), NOW())`,
      [
        otherRoutineId,
        otherOwnerId,
        `${otherRoutineId}-routine`,
        'Other Owner Routine',
      ],
    );
    await pool.query(
      `INSERT INTO "RoutineExercise"
        ("id", "routineId", "exerciseSlug", "order", "sets", "minReps", "maxReps", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, 0, 3, 8, 10, NOW(), NOW())`,
      [otherRoutineExerciseId, otherRoutineId, seededExercise.slug],
    );
    await pool.query(
      `INSERT INTO "Routine"
        ("id", "ownerId", "slug", "name", "visibility", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, $4, 'PRIVATE', NOW(), NOW())`,
      [routineId, ownerId, `${routineId}-routine`, 'Race Test Routine'],
    );
    await pool.query(
      `INSERT INTO "RoutineExercise"
        ("id", "routineId", "exerciseSlug", "order", "sets", "minReps", "maxReps", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, 0, 3, 8, 10, NOW(), NOW())`,
      [routineExerciseId, routineId, seededExercise.slug],
    );
    await pool.query(
      `INSERT INTO "AdoptedTrainingProgram"
        ("id", "ownerId", "programNameSnapshot", "durationWeeksSnapshot", "startedAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, 1, NOW(), NOW())`,
      [programId, ownerId, 'Race Test Program'],
    );
    await pool.query(
      `INSERT INTO "ProgramWorkoutOccurrence"
        ("id", "adoptedTrainingProgramId", "sourceRoutineId", "weekNumber", "dayNumber", "routineNameSnapshot", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 1, $4, NOW())`,
      [occurrenceId, programId, routineId, 'Race Test Routine'],
    );
    await pool.query(
      `INSERT INTO "AdoptedTrainingProgram"
        ("id", "ownerId", "programNameSnapshot", "durationWeeksSnapshot", "startedAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, 1, NOW(), NOW())`,
      [otherProgramId, otherOwnerId, 'Other Owner Program'],
    );
    await pool.query(
      `INSERT INTO "ProgramWorkoutOccurrence"
        ("id", "adoptedTrainingProgramId", "sourceRoutineId", "weekNumber", "dayNumber", "routineNameSnapshot", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 1, $4, NOW()),
              ($5::uuid, $2::uuid, $3::uuid, 1, 2, $4, NOW())`,
      [
        otherOccurrenceId,
        otherProgramId,
        otherRoutineId,
        'Other Owner Routine',
        otherOccurrenceTwoId,
      ],
    );

    module = await Test.createTestingModule({
      providers: [
        PrismaAdoptedTrainingProgramsAdapter,
        PrismaService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => databaseUrl },
        },
      ],
    }).compile();
    await module.init();
    adapter = module.get(PrismaAdoptedTrainingProgramsAdapter);
  });

  afterAll(async () => {
    await module?.close();
    await pool?.query(
      'DELETE FROM "WorkoutSession" WHERE "ownerId" = $1::uuid',
      [ownerId],
    );
    await pool?.query(
      'DELETE FROM "ProgramWorkoutOccurrence" WHERE "id" = $1::uuid',
      [occurrenceId],
    );
    await pool?.query(
      'DELETE FROM "AdoptedTrainingProgram" WHERE "id" = $1::uuid',
      [programId],
    );
    await pool?.query(
      `DELETE FROM "ProgramWorkoutOccurrence"
       WHERE "adoptedTrainingProgramId" IN (
         SELECT "id" FROM "AdoptedTrainingProgram"
         WHERE "ownerId" = $1::uuid
       )`,
      [otherOwnerId],
    );
    await pool?.query(
      'DELETE FROM "AdoptedTrainingProgram" WHERE "ownerId" = $1::uuid',
      [otherOwnerId],
    );
    await pool?.query('DELETE FROM "RoutineExercise" WHERE "id" = $1::uuid', [
      otherRoutineExerciseId,
    ]);
    await pool?.query('DELETE FROM "Routine" WHERE "id" = $1::uuid', [
      otherRoutineId,
    ]);
    await pool?.query('DELETE FROM "RoutineExercise" WHERE "id" = $1::uuid', [
      routineExerciseId,
    ]);
    await pool?.query('DELETE FROM "Routine" WHERE "id" = $1::uuid', [
      routineId,
    ]);
    await pool?.query('DELETE FROM "user" WHERE "id" = $1::uuid', [ownerId]);
    await pool?.query('DELETE FROM "user" WHERE "id" = $1::uuid', [
      otherOwnerId,
    ]);
    await pool?.end();
  });

  async function insertSession(input: {
    ownerId: string;
    occurrenceId: string;
    routineId: string;
    status: 'IN_PROGRESS';
  }) {
    const now = new Date();
    return pool.query(
      `INSERT INTO "WorkoutSession"
        ("id", "ownerId", "sourceRoutineId", "sourceRoutineNameSnapshot",
         "programWorkoutOccurrenceId", "status", "timezone", "startedAt",
         "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, $6, $7, $8, $8, $8)`,
      [
        randomUUID(),
        input.ownerId,
        input.routineId,
        'Index Test Routine',
        input.occurrenceId,
        input.status,
        'UTC',
        now,
      ],
    );
  }

  async function resetPrimaryFixture() {
    await pool.query(
      'DELETE FROM "WorkoutSession" WHERE "programWorkoutOccurrenceId" = $1::uuid',
      [occurrenceId],
    );
    await pool.query(
      `UPDATE "ProgramWorkoutOccurrence"
       SET "status" = 'PENDING'
       WHERE "id" = $1::uuid`,
      [occurrenceId],
    );
    await pool.query(
      `UPDATE "AdoptedTrainingProgram"
       SET "status" = 'ACTIVE', "completedAt" = NULL, "cancelledAt" = NULL
       WHERE "id" = $1::uuid`,
      [programId],
    );
  }

  it('projects a visible routine with active exercises as startable', async () => {
    const detail = await adapter.findOwnedDetailById(programId, ownerId);

    expect(detail?.nextPendingOccurrence?.sourceRoutineAvailable).toBe(true);
    expect(detail?.actions.canStartNext).toBe(true);
  });

  it('allows one concurrent start and rolls back the losing transaction', async () => {
    await resetPrimaryFixture();
    const results = await Promise.allSettled([
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'Asia/Qatar',
      }),
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'Asia/Qatar',
      }),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = results.find((result) => result.status === 'rejected');
    expect(rejected?.status).toBe('rejected');
    if (rejected?.status === 'rejected') {
      expect(rejected.reason).toBeInstanceOf(
        AdoptedTrainingProgramConcurrencyError,
      );
    }

    const persisted = await pool.query<{
      sessions: string;
      performances: string;
      status: string;
    }>(
      `SELECT COUNT(DISTINCT session."id")::text AS "sessions",
              COUNT(performance."id")::text AS "performances",
              occurrence."status"::text AS "status"
       FROM "ProgramWorkoutOccurrence" AS occurrence
       LEFT JOIN "WorkoutSession" AS session
         ON session."programWorkoutOccurrenceId" = occurrence."id"
       LEFT JOIN "ExercisePerformance" AS performance
         ON performance."workoutSessionId" = session."id"
       WHERE occurrence."id" = $1::uuid
       GROUP BY occurrence."status"`,
      [occurrenceId],
    );
    expect(persisted.rows[0]).toEqual({
      sessions: '1',
      performances: '1',
      status: 'IN_PROGRESS',
    });
  });

  it("does not expose or execute another owner's adopted program", async () => {
    await expect(
      adapter.findOwnedDetailById(otherProgramId, ownerId),
    ).resolves.toBeNull();

    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: otherProgramId,
        occurrenceId: otherOccurrenceId,
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramConcurrencyError);
  });

  it('rejects a second non-terminal program without leaving its nested occurrence', async () => {
    const duplicate = AdoptedTrainingProgram.create({
      ownerId,
      programNameSnapshot: 'Duplicate Program',
      durationWeeksSnapshot: 1,
      startedAt: new Date(),
      occurrences: [
        {
          sourceTrainingProgramRoutineId: null,
          sourceRoutineId: null,
          weekNumber: 1,
          dayNumber: 1,
          routineNameSnapshot: 'Duplicate Routine',
          programSlotNotesSnapshot: null,
        },
      ],
    });

    await expect(adapter.create(duplicate)).rejects.toMatchObject({
      name: 'AdoptedTrainingProgramAlreadyNonTerminalError',
    });

    const persisted = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM "ProgramWorkoutOccurrence"
       WHERE "id" = $1::uuid`,
      [duplicate.toValue().occurrences[0]?.id],
    );
    expect(persisted.rows[0]?.count).toBe('0');
  });

  it('rejects an already active occurrence without creating another session', async () => {
    await resetPrimaryFixture();
    await insertSession({
      ownerId,
      occurrenceId,
      routineId,
      status: 'IN_PROGRESS',
    });

    await expect(
      adapter.startProgramWorkout({
        ownerId,
        adoptedTrainingProgramId: programId,
        occurrenceId,
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(AdoptedTrainingProgramConcurrencyError);

    const persisted = await pool.query<{ status: string; sessions: string }>(
      `SELECT occurrence."status"::text AS status,
              COUNT(session."id")::text AS sessions
       FROM "ProgramWorkoutOccurrence" AS occurrence
       LEFT JOIN "WorkoutSession" AS session
         ON session."programWorkoutOccurrenceId" = occurrence."id"
       WHERE occurrence."id" = $1::uuid
       GROUP BY occurrence."status"`,
      [occurrenceId],
    );
    expect(persisted.rows[0]).toEqual({ status: 'PENDING', sessions: '1' });
  });

  it('enforces the persisted completed-session and active-owner invariants', async () => {
    await resetPrimaryFixture();
    await adapter.startProgramWorkout({
      ownerId,
      adoptedTrainingProgramId: programId,
      occurrenceId,
      timezone: 'UTC',
    });
    const indexes = await pool.query<{
      indexname: string;
      indisunique: boolean;
      predicate: string | null;
    }>(
      `SELECT pg_indexes.indexname,
              pg_index.indisunique,
              pg_get_expr(pg_index.indpred, pg_index.indrelid) AS predicate
       FROM pg_indexes
       JOIN pg_class ON pg_class.relname = pg_indexes.indexname
       JOIN pg_index ON pg_index.indexrelid = pg_class.oid
       WHERE tablename IN ('WorkoutSession', 'AdoptedTrainingProgram')
         AND indexname IN (
           'WorkoutSession_one_in_progress_per_owner_idx',
           'WorkoutSession_one_in_progress_per_occurrence_idx',
           'WorkoutSession_one_completed_per_occurrence_idx',
           'AdoptedTrainingProgram_one_non_terminal_per_owner_idx'
         )
       ORDER BY indexname`,
    );
    expect(indexes.rows.map((row) => row.indexname)).toEqual([
      'AdoptedTrainingProgram_one_non_terminal_per_owner_idx',
      'WorkoutSession_one_completed_per_occurrence_idx',
      'WorkoutSession_one_in_progress_per_occurrence_idx',
      'WorkoutSession_one_in_progress_per_owner_idx',
    ]);
    expect(indexes.rows.every((row) => row.indisunique)).toBe(true);
    const predicates = new Map(
      indexes.rows.map((row) => [row.indexname, row.predicate ?? '']),
    );
    expect(
      normalizePredicate(
        predicates.get('AdoptedTrainingProgram_one_non_terminal_per_owner_idx'),
      ),
    ).toBe('STATUS = ANY (ARRAY[ACTIVE, PAUSED])');
    expect(
      normalizePredicate(
        predicates.get('WorkoutSession_one_in_progress_per_owner_idx'),
      ),
    ).toBe('STATUS = IN_PROGRESS');
    expect(
      normalizePredicate(
        predicates.get('WorkoutSession_one_in_progress_per_occurrence_idx'),
      ),
    ).toBe(
      '(PROGRAMWORKOUTOCCURRENCEID IS NOT NULL) AND (STATUS = IN_PROGRESS)',
    );
    expect(
      normalizePredicate(
        predicates.get('WorkoutSession_one_completed_per_occurrence_idx'),
      ),
    ).toBe('(PROGRAMWORKOUTOCCURRENCEID IS NOT NULL) AND (STATUS = COMPLETED)');

    const completedSessionId = randomUUID();
    const duplicateCompletedSessionId = randomUUID();
    const now = new Date();
    await pool.query(
      `INSERT INTO "WorkoutSession"
        ("id", "ownerId", "sourceRoutineId", "sourceRoutineNameSnapshot",
         "programWorkoutOccurrenceId", "status", "timezone", "startedAt",
         "completedAt", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, 'COMPLETED', $6,
               $7, $7, $7, $7)`,
      [
        completedSessionId,
        ownerId,
        routineId,
        'Race Test Routine',
        occurrenceId,
        'UTC',
        now,
      ],
    );

    await expect(
      pool.query(
        `INSERT INTO "WorkoutSession"
          ("id", "ownerId", "sourceRoutineId", "sourceRoutineNameSnapshot",
           "programWorkoutOccurrenceId", "status", "timezone", "startedAt",
           "completedAt", "createdAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, 'COMPLETED', $6,
                 $7, $7, $7, $7)`,
        [
          duplicateCompletedSessionId,
          ownerId,
          routineId,
          'Race Test Routine',
          occurrenceId,
          'UTC',
          now,
        ],
      ),
    ).rejects.toMatchObject({
      code: '23505',
      constraint: 'WorkoutSession_one_completed_per_occurrence_idx',
    });

    await expect(
      pool.query(
        `INSERT INTO "WorkoutSession"
          ("id", "ownerId", "sourceRoutineId", "sourceRoutineNameSnapshot",
           "programWorkoutOccurrenceId", "status", "timezone", "startedAt",
           "createdAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, 'IN_PROGRESS', $6,
                 $7, $7, $7)`,
        [
          randomUUID(),
          ownerId,
          routineId,
          'Race Test Routine',
          occurrenceId,
          'UTC',
          now,
        ],
      ),
    ).rejects.toMatchObject({
      code: '23505',
    });

    await expect(
      insertSession({
        ownerId,
        occurrenceId: otherOccurrenceId,
        routineId: otherRoutineId,
        status: 'IN_PROGRESS',
      }),
    ).rejects.toMatchObject({
      code: '23505',
      constraint: 'WorkoutSession_one_in_progress_per_owner_idx',
    });

    await expect(
      insertSession({
        ownerId: otherOwnerId,
        occurrenceId,
        routineId,
        status: 'IN_PROGRESS',
      }),
    ).rejects.toMatchObject({
      code: '23505',
      constraint: 'WorkoutSession_one_in_progress_per_occurrence_idx',
    });
  });

  it('skips non-final occurrences and supports successful cancellation', async () => {
    await expect(
      adapter.skipOccurrence({
        ownerId: otherOwnerId,
        adoptedTrainingProgramId: otherProgramId,
        occurrenceId: otherOccurrenceId,
      }),
    ).resolves.toMatchObject({ id: otherProgramId, status: 'ACTIVE' });

    await expect(
      adapter.skipOccurrence({
        ownerId: otherOwnerId,
        adoptedTrainingProgramId: otherProgramId,
        occurrenceId: otherOccurrenceTwoId,
      }),
    ).resolves.toMatchObject({ id: otherProgramId, status: 'COMPLETED' });

    const statuses = await pool.query<{ status: string }>(
      `SELECT "status"::text AS status
       FROM "ProgramWorkoutOccurrence"
       WHERE "adoptedTrainingProgramId" = $1::uuid
       ORDER BY "dayNumber"`,
      [otherProgramId],
    );
    expect(statuses.rows.map((row) => row.status)).toEqual([
      'SKIPPED',
      'SKIPPED',
    ]);

    const cancelProgramId = randomUUID();
    await pool.query(
      `INSERT INTO "AdoptedTrainingProgram"
        ("id", "ownerId", "programNameSnapshot", "durationWeeksSnapshot", "startedAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, 1, NOW(), NOW())`,
      [cancelProgramId, otherOwnerId, 'Cancel Test Program'],
    );
    await expect(
      adapter.cancel({
        ownerId: otherOwnerId,
        adoptedTrainingProgramId: cancelProgramId,
      }),
    ).resolves.toMatchObject({ id: cancelProgramId, status: 'CANCELLED' });
  });
});
