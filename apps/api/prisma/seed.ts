import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '../generated/prisma/client';
import { seedEquipment } from './seeders/seed-equipment';
import { seedExercises } from './seeders/seed-exercises';
import { seedMovementPatterns } from './seeders/seed-movement-patterns';
import { seedMuscleFunctionAssignments } from './seeders/seed-muscle-function-assignments';
import { seedMuscleFunctions } from './seeders/seed-muscle-functions';
import { seedMuscleGroups } from './seeders/seed-muscle-groups';
import { seedMuscles } from './seeders/seed-muscles';
import { validateSeedData } from './seeders/validate-seed-data';
import { verifySeed } from './seeders/verify-seed';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined.');
}

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main(): Promise<void> {
  console.log('Starting database seed...');
  validateSeedData();

  // 1. Muscle groups
  const muscleGroupIdsBySlug = await seedMuscleGroups(prisma);

  // 2. Muscles
  const muscleIdsBySlug = await seedMuscles(prisma, muscleGroupIdsBySlug);

  // 3. Muscle functions
  const muscleFunctionIdsBySlug = await seedMuscleFunctions(prisma);

  // 4. Muscle-function assignments
  await seedMuscleFunctionAssignments(
    prisma,
    muscleIdsBySlug,
    muscleFunctionIdsBySlug,
  );

  // 5. Equipment
  const equipmentIdsBySlug = await seedEquipment(prisma);

  // 6. Movement patterns
  const movementPatternIdsBySlug = await seedMovementPatterns(prisma);

  /*
   * 7–11. Each exercise is seeded in one transaction:
   * exercise, muscles, equipment, capability profile, demand profile.
   */
  await seedExercises(prisma, {
    muscleIdsBySlug,
    equipmentIdsBySlug,
    movementPatternIdsBySlug,
  });

  await verifySeed(prisma);
  console.log('Database seed completed successfully.');
}

main()
  .catch((error: unknown) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
