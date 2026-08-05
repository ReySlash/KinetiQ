import type { PrismaClient } from '../../generated/prisma/client';
import { systemUser } from '../seed-data/system-user';

export async function seedSystemUser(prisma: PrismaClient): Promise<string> {
  const user = await prisma.user.upsert({
    where: { id: systemUser.id },
    update: {
      name: systemUser.name,
      email: systemUser.email,
      emailVerified: systemUser.emailVerified,
      role: systemUser.role,
    },
    create: systemUser,
    select: { id: true },
  });

  return user.id;
}
