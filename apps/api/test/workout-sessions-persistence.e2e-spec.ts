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

  afterAll(async () => {
    await pool?.end();
  });
});
