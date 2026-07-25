import { randomUUID } from 'node:crypto';

import type { PrismaClient } from '../../generated/prisma/client';
import { muscleFunctions } from '../seed-data/muscle-functions';

export async function seedMuscleFunctions(
  prisma: PrismaClient,
): Promise<Map<string, string>> {
  console.log(`Seeding ${muscleFunctions.length} muscle functions...`);

  const idsBySlug = new Map<string, string>();

  for (const muscleFunction of muscleFunctions) {
    const savedFunction = await prisma.muscleFunction.upsert({
      where: { slug: muscleFunction.slug },
      update: {
        name: muscleFunction.name,
        description: muscleFunction.description,
        sortOrder: muscleFunction.sortOrder,
        isActive: muscleFunction.isActive ?? true,
      },
      create: {
        id: randomUUID(),
        ...muscleFunction,
        isActive: muscleFunction.isActive ?? true,
      },
    });

    idsBySlug.set(savedFunction.slug, savedFunction.id);
  }

  return idsBySlug;
}
