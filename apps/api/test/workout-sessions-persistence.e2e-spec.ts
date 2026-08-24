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
      `INSERT INTO "user" ("id", "name", "email")
       VALUES ($1::uuid, $2, $3)`,
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

  afterAll(async () => {
    await pool?.end();
  });
});
