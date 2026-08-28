import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';

describe('WorkoutSession persistence constraints (e2e)', () => {
  let pool: Pool;
  const ownerId = randomUUID();
  const sessionId = randomUUID();

  beforeAll(() => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required for persistence e2e tests.');
    }
    pool = new Pool({ connectionString: databaseUrl });
  });

  it('enforces one in-progress session per owner and optimistic version updates', async () => {
    await pool.query(
      `INSERT INTO "user" ("id", "name", "email", "updatedAt")
       VALUES ($1::uuid, $2, $3, NOW())`,
      [ownerId, 'Workout Test User', `${ownerId}@example.test`],
    );
    await pool.query(
      `INSERT INTO "WorkoutSession"
        ("id", "ownerId", "timezone", "startedAt", "updatedAt", "version")
       VALUES ($1::uuid, $2::uuid, $3, NOW(), NOW(), 0)`,
      [sessionId, ownerId, 'Asia/Qatar'],
    );

    await expect(
      pool.query(
        `INSERT INTO "WorkoutSession"
          ("id", "ownerId", "timezone", "startedAt", "updatedAt", "version")
         VALUES ($1::uuid, $2::uuid, $3, NOW(), NOW(), 0)`,
        [randomUUID(), ownerId, 'Asia/Qatar'],
      ),
    ).rejects.toMatchObject({ code: '23505' });

    const firstWrite = await pool.query(
      `UPDATE "WorkoutSession"
       SET "version" = "version" + 1, "updatedAt" = NOW()
       WHERE "id" = $1::uuid AND "ownerId" = $2::uuid AND "version" = $3`,
      [sessionId, ownerId, 0],
    );
    const staleWrite = await pool.query(
      `UPDATE "WorkoutSession"
       SET "version" = "version" + 1, "updatedAt" = NOW()
       WHERE "id" = $1::uuid AND "ownerId" = $2::uuid AND "version" = $3`,
      [sessionId, ownerId, 0],
    );

    expect(firstWrite.rowCount).toBe(1);
    expect(staleWrite.rowCount).toBe(0);
  });

  it('preserves decimal precision and enforces ordered historical children', async () => {
    const exercise = await pool.query<{ id: string }>(
      `SELECT "id" FROM "Exercise" ORDER BY "id" LIMIT 1`,
    );
    const exerciseId = exercise.rows[0]?.id;
    if (!exerciseId)
      throw new Error('The test database must contain an exercise.');

    const performanceId = randomUUID();
    await pool.query(
      `INSERT INTO "ExercisePerformance"
        ("id", "workoutSessionId", "exerciseId", "order", "exerciseNameSnapshot", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3::uuid, 0, $4, NOW(), NOW())`,
      [performanceId, sessionId, exerciseId, 'Historical Test Exercise'],
    );

    const setId = randomUUID();
    await pool.query(
      `INSERT INTO "CompletedSet"
        ("id", "exercisePerformanceId", "order", "repetitions", "loadKg", "loadUnit", "completedAt", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, 0, 10, $3::numeric, 'KG', NOW(), NOW(), NOW())`,
      [setId, performanceId, '100.25'],
    );

    const result = await pool.query<{ loadKg: string }>(
      `SELECT "loadKg"::text AS "loadKg"
       FROM "CompletedSet"
       WHERE "id" = $1::uuid`,
      [setId],
    );
    expect(result.rows[0]?.loadKg).toBe('100.25');

    await expect(
      pool.query(
        `INSERT INTO "CompletedSet"
          ("id", "exercisePerformanceId", "order", "repetitions", "loadKg", "loadUnit", "completedAt", "createdAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, 0, 8, 80, 'KG', NOW(), NOW(), NOW())`,
        [randomUUID(), performanceId],
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('preserves session history when a source routine is deleted', async () => {
    const routineId = randomUUID();
    await pool.query(
      `INSERT INTO "Routine"
        ("id", "ownerId", "slug", "name", "visibility", "createdAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, $4, 'PRIVATE', NOW(), NOW())`,
      [routineId, ownerId, `${routineId}-routine`, 'Historical Routine'],
    );
    await pool.query(
      `UPDATE "WorkoutSession"
       SET "sourceRoutineId" = $1::uuid, "sourceRoutineNameSnapshot" = $2
       WHERE "id" = $3::uuid`,
      [routineId, 'Historical Routine', sessionId],
    );

    await pool.query(`DELETE FROM "Routine" WHERE "id" = $1::uuid`, [
      routineId,
    ]);

    const result = await pool.query<{
      sourceRoutineId: string | null;
      sourceRoutineNameSnapshot: string | null;
    }>(
      `SELECT "sourceRoutineId", "sourceRoutineNameSnapshot"
       FROM "WorkoutSession"
       WHERE "id" = $1::uuid`,
      [sessionId],
    );
    expect(result.rows[0]).toEqual({
      sourceRoutineId: null,
      sourceRoutineNameSnapshot: 'Historical Routine',
    });
  });

  it('persists adopted schedules and enforces adopted-program attempt invariants', async () => {
    const adoptedOwnerId = randomUUID();
    const adoptedProgramId = randomUUID();
    const duplicateProgramId = randomUUID();
    const occurrenceId = randomUUID();
    const completedOccurrenceId = randomUUID();
    const inProgressSessionId = randomUUID();
    const duplicateInProgressSessionId = randomUUID();
    const completedSessionId = randomUUID();
    const duplicateCompletedSessionId = randomUUID();

    await pool.query(
      `INSERT INTO "user" ("id", "name", "email", "updatedAt")
       VALUES ($1::uuid, $2, $3, NOW())`,
      [
        adoptedOwnerId,
        'Adopted Program Test User',
        `${adoptedOwnerId}@example.test`,
      ],
    );
    await pool.query(
      `INSERT INTO "AdoptedTrainingProgram"
        ("id", "ownerId", "programNameSnapshot", "durationWeeksSnapshot", "startedAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, $4, NOW(), NOW())`,
      [adoptedProgramId, adoptedOwnerId, 'Strength Foundation', 8],
    );

    await expect(
      pool.query(
        `INSERT INTO "AdoptedTrainingProgram"
          ("id", "ownerId", "programNameSnapshot", "durationWeeksSnapshot", "startedAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, $3, $4, NOW(), NOW())`,
        [duplicateProgramId, adoptedOwnerId, 'Another Program', 4],
      ),
    ).rejects.toMatchObject({ code: '23505' });

    await pool.query(
      `INSERT INTO "ProgramWorkoutOccurrence"
        ("id", "adoptedTrainingProgramId", "weekNumber", "dayNumber", "routineNameSnapshot", "programSlotNotesSnapshot", "updatedAt")
       VALUES ($1::uuid, $2::uuid, 1, 1, $3, $4, NOW())`,
      [
        occurrenceId,
        adoptedProgramId,
        'Upper Body Strength',
        'Start with a controlled warm-up',
      ],
    );
    await pool.query(
      `INSERT INTO "WorkoutSession"
        ("id", "ownerId", "programWorkoutOccurrenceId", "timezone", "startedAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4, NOW(), NOW())`,
      [inProgressSessionId, adoptedOwnerId, occurrenceId, 'Asia/Qatar'],
    );

    const persisted = await pool.query<{
      programNameSnapshot: string;
      weekNumber: number;
      routineNameSnapshot: string;
      programWorkoutOccurrenceId: string;
    }>(
      `SELECT program."programNameSnapshot", workout."weekNumber",
              workout."routineNameSnapshot", session."programWorkoutOccurrenceId"
       FROM "AdoptedTrainingProgram" AS program
       JOIN "ProgramWorkoutOccurrence" AS workout
         ON workout."adoptedTrainingProgramId" = program."id"
       JOIN "WorkoutSession" AS session
         ON session."programWorkoutOccurrenceId" = workout."id"
       WHERE program."id" = $1::uuid`,
      [adoptedProgramId],
    );
    expect(persisted.rows[0]).toEqual({
      programNameSnapshot: 'Strength Foundation',
      weekNumber: 1,
      routineNameSnapshot: 'Upper Body Strength',
      programWorkoutOccurrenceId: occurrenceId,
    });

    await expect(
      pool.query(
        `INSERT INTO "WorkoutSession"
          ("id", "ownerId", "programWorkoutOccurrenceId", "timezone", "startedAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, $3::uuid, $4, NOW(), NOW())`,
        [
          duplicateInProgressSessionId,
          adoptedOwnerId,
          occurrenceId,
          'Asia/Qatar',
        ],
      ),
    ).rejects.toMatchObject({ code: '23505' });

    await pool.query(
      `INSERT INTO "ProgramWorkoutOccurrence"
        ("id", "adoptedTrainingProgramId", "weekNumber", "dayNumber", "routineNameSnapshot", "updatedAt")
       VALUES ($1::uuid, $2::uuid, 1, 2, $3, NOW())`,
      [completedOccurrenceId, adoptedProgramId, 'Lower Body Strength'],
    );
    await pool.query(
      `INSERT INTO "WorkoutSession"
        ("id", "ownerId", "programWorkoutOccurrenceId", "status", "timezone", "startedAt", "completedAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3::uuid, 'COMPLETED', $4, NOW(), NOW(), NOW())`,
      [completedSessionId, adoptedOwnerId, completedOccurrenceId, 'Asia/Qatar'],
    );

    await expect(
      pool.query(
        `INSERT INTO "WorkoutSession"
          ("id", "ownerId", "programWorkoutOccurrenceId", "status", "timezone", "startedAt", "completedAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, $3::uuid, 'COMPLETED', $4, NOW(), NOW(), NOW())`,
        [
          duplicateCompletedSessionId,
          adoptedOwnerId,
          completedOccurrenceId,
          'Asia/Qatar',
        ],
      ),
    ).rejects.toMatchObject({ code: '23505' });

    await expect(
      pool.query(
        `DELETE FROM "ProgramWorkoutOccurrence" WHERE "id" = $1::uuid`,
        [occurrenceId],
      ),
    ).rejects.toMatchObject({ code: '23001' });

    const preservedSession = await pool.query<{
      programWorkoutOccurrenceId: string | null;
    }>(
      `SELECT "programWorkoutOccurrenceId"
       FROM "WorkoutSession"
       WHERE "id" = $1::uuid`,
      [inProgressSessionId],
    );
    expect(preservedSession.rows[0]?.programWorkoutOccurrenceId).toBe(
      occurrenceId,
    );
  });

  it('enforces one non-terminal adopted program per owner', async () => {
    const cases = [
      { first: 'ACTIVE', second: 'PAUSED', allowed: false },
      { first: 'PAUSED', second: 'ACTIVE', allowed: false },
      { first: 'PAUSED', second: 'PAUSED', allowed: false },
      { first: 'COMPLETED', second: 'ACTIVE', allowed: true },
      { first: 'CANCELLED', second: 'ACTIVE', allowed: true },
    ] as const;

    for (const [index, testCase] of cases.entries()) {
      const ownerId = randomUUID();
      const firstProgramId = randomUUID();
      const secondProgramId = randomUUID();

      await pool.query(
        `INSERT INTO "user" ("id", "name", "email", "updatedAt")
         VALUES ($1::uuid, $2, $3, NOW())`,
        [ownerId, `Adoption Matrix User ${index}`, `${ownerId}@example.test`],
      );
      await pool.query(
        `INSERT INTO "AdoptedTrainingProgram"
          ("id", "ownerId", "programNameSnapshot", "durationWeeksSnapshot", "status", "startedAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, $3, 4, $4, NOW(), NOW())`,
        [firstProgramId, ownerId, `First ${index}`, testCase.first],
      );

      const secondInsert = pool.query(
        `INSERT INTO "AdoptedTrainingProgram"
          ("id", "ownerId", "programNameSnapshot", "durationWeeksSnapshot", "status", "startedAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, $3, 4, $4, NOW(), NOW())`,
        [secondProgramId, ownerId, `Second ${index}`, testCase.second],
      );

      if (testCase.allowed) {
        await expect(secondInsert).resolves.toBeDefined();
      } else {
        await expect(secondInsert).rejects.toMatchObject({ code: '23505' });
      }
    }
  });

  it('allows cancelled session attempts alongside cancelled and in-progress attempts', async () => {
    const ownerId = randomUUID();
    const adoptedProgramId = randomUUID();
    const occurrenceId = randomUUID();

    await pool.query(
      `INSERT INTO "user" ("id", "name", "email", "updatedAt")
       VALUES ($1::uuid, $2, $3, NOW())`,
      [ownerId, 'Cancelled Attempt Test User', `${ownerId}@example.test`],
    );
    await pool.query(
      `INSERT INTO "AdoptedTrainingProgram"
        ("id", "ownerId", "programNameSnapshot", "durationWeeksSnapshot", "startedAt", "updatedAt")
       VALUES ($1::uuid, $2::uuid, $3, 4, NOW(), NOW())`,
      [adoptedProgramId, ownerId, 'Retryable Program'],
    );
    await pool.query(
      `INSERT INTO "ProgramWorkoutOccurrence"
        ("id", "adoptedTrainingProgramId", "weekNumber", "dayNumber", "routineNameSnapshot", "updatedAt")
       VALUES ($1::uuid, $2::uuid, 1, 1, $3, NOW())`,
      [occurrenceId, adoptedProgramId, 'Retryable Workout'],
    );

    for (const sessionId of [randomUUID(), randomUUID()]) {
      await pool.query(
        `INSERT INTO "WorkoutSession"
          ("id", "ownerId", "programWorkoutOccurrenceId", "status", "timezone", "startedAt", "cancelledAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, $3::uuid, 'CANCELLED', $4, NOW(), NOW(), NOW())`,
        [sessionId, ownerId, occurrenceId, 'Asia/Qatar'],
      );
    }

    await expect(
      pool.query(
        `INSERT INTO "WorkoutSession"
          ("id", "ownerId", "programWorkoutOccurrenceId", "timezone", "startedAt", "updatedAt")
         VALUES ($1::uuid, $2::uuid, $3::uuid, $4, NOW(), NOW())`,
        [randomUUID(), ownerId, occurrenceId, 'Asia/Qatar'],
      ),
    ).resolves.toBeDefined();
  });

  afterAll(async () => {
    await pool?.end();
  });
});
