import { randomUUID } from 'node:crypto';

import type { PrismaClient } from '../../generated/prisma/client';
import { movementPatterns } from '../seed-data/movement-patterns';

export async function seedMovementPatterns(
  prisma: PrismaClient,
): Promise<Map<string, string>> {
  console.log(`Seeding ${movementPatterns.length} movement patterns...`);

  const idsBySlug = new Map<string, string>();

  for (const movementPattern of movementPatterns) {
    const savedPattern = await prisma.movementPattern.upsert({
      where: { slug: movementPattern.slug },
      update: {
        name: movementPattern.name,
        description: movementPattern.description,
        isActive: movementPattern.isActive,
        sortOrder: movementPattern.sortOrder,
      },
      create: {
        id: randomUUID(),
        ...movementPattern,
      },
    });

    idsBySlug.set(savedPattern.slug, savedPattern.id);
  }

  return idsBySlug;
}
