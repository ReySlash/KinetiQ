import { randomUUID } from 'node:crypto';

import type { PrismaClient } from '../../generated/prisma/client';
import { muscleGroups } from '../seed-data/muscle-groups';

export async function seedMuscleGroups(
  prisma: PrismaClient,
): Promise<Map<string, string>> {
  console.log(`Seeding ${muscleGroups.length} muscle groups...`);

  const idsBySlug = new Map<string, string>();

  for (const muscleGroup of muscleGroups) {
    const savedGroup = await prisma.muscleGroup.upsert({
      where: { slug: muscleGroup.slug },
      update: {
        name: muscleGroup.name,
        description: muscleGroup.description,
        bodyRegion: muscleGroup.bodyRegion,
        imageAltText: muscleGroup.imageAltText,
        sortOrder: muscleGroup.sortOrder,
      },
      create: {
        id: randomUUID(),
        ...muscleGroup,
        thumbnailUrl: null,
        thumbnailStorageKey: null,
      },
    });

    idsBySlug.set(savedGroup.slug, savedGroup.id);
  }

  return idsBySlug;
}
