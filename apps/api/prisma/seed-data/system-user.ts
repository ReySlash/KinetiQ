import { PlatformRole } from '../../generated/prisma/client';

export const SYSTEM_USER_ID = '00000000-0000-4000-8000-000000000001';

export const systemUser = {
  id: SYSTEM_USER_ID,
  name: 'KinetiQ',
  email: 'routines@system.kinetiq.local',
  emailVerified: true,
  role: PlatformRole.ADMIN,
} as const;
