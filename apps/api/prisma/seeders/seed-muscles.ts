import { randomUUID } from 'node:crypto';

import type { PrismaClient } from '../../generated/prisma/client';
import { childMuscles, parentMuscles } from '../seed-data/muscles';
import type { MuscleSeed } from '../seed-data/types';
import { getRequiredId } from './helpers';

async function upsertMuscle(
  prisma: PrismaClient,
  muscle: MuscleSeed,
  muscleGroupIdsBySlug: ReadonlyMap<string, string>,
  muscleIdsBySlug: ReadonlyMap<string, string>,
): Promise<string> {
  const muscleGroupId = getRequiredId(
    muscleGroupIdsBySlug,
    muscle.muscleGroupSlug,
    'Muscle group',
  );
  const parentId = muscle.parentSlug
    ? getRequiredId(muscleIdsBySlug, muscle.parentSlug, 'Parent muscle')
    : null;

  const savedMuscle = await prisma.muscle.upsert({
    where: { slug: muscle.slug },
    update: {
      name: muscle.name,
      description: muscle.description,
      bodyRegion: muscle.bodyRegion,
      muscleGroupId,
      parentId,
      imageAltText: muscle.imageAltText,
      isActive: muscle.isActive ?? true,
      sortOrder: muscle.sortOrder,
    },
    create: {
      id: randomUUID(),
      name: muscle.name,
      slug: muscle.slug,
      description: muscle.description,
      bodyRegion: muscle.bodyRegion,
      muscleGroupId,
      parentId,
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: muscle.imageAltText,
      isActive: muscle.isActive ?? true,
      sortOrder: muscle.sortOrder,
    },
  });

  return savedMuscle.id;
}

export async function seedMuscles(
  prisma: PrismaClient,
  muscleGroupIdsBySlug: ReadonlyMap<string, string>,
): Promise<Map<string, string>> {
  console.log(
    `Seeding ${parentMuscles.length + childMuscles.length} muscles...`,
  );

  const idsBySlug = new Map<string, string>();

  for (const muscle of parentMuscles) {
    idsBySlug.set(
      muscle.slug,
      await upsertMuscle(prisma, muscle, muscleGroupIdsBySlug, idsBySlug),
    );
  }

  for (const muscle of childMuscles) {
    idsBySlug.set(
      muscle.slug,
      await upsertMuscle(prisma, muscle, muscleGroupIdsBySlug, idsBySlug),
    );
  }

  return idsBySlug;
}
