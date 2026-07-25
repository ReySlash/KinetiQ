import { randomUUID } from 'node:crypto';

import type { PrismaClient } from '../../generated/prisma/client';
import { equipment } from '../seed-data/equipment';

export async function seedEquipment(
  prisma: PrismaClient,
): Promise<Map<string, string>> {
  console.log(`Seeding ${equipment.length} equipment records...`);

  const idsBySlug = new Map<string, string>();

  for (const equipmentItem of equipment) {
    const savedEquipment = await prisma.equipment.upsert({
      where: { slug: equipmentItem.slug },
      update: {
        name: equipmentItem.name,
        description: equipmentItem.description,
        isActive: equipmentItem.isActive,
        sortOrder: equipmentItem.sortOrder,
      },
      create: {
        id: randomUUID(),
        ...equipmentItem,
      },
    });

    idsBySlug.set(savedEquipment.slug, savedEquipment.id);
  }

  return idsBySlug;
}
