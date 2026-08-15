import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const PLATFORM_ROLES = ['USER', 'ADMIN'] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export interface BetterAuthSession {
  session: {
    id: string;
  };
  user: {
    id: string;
    role?: string | string[] | null;
  };
}

export interface AuthenticatedPrincipal {
  userId: string;
  role: PlatformRole;
  sessionId: string;
}

export interface AuthenticatedRequest {
  session?: BetterAuthSession | null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isPlatformRole(value: unknown): value is PlatformRole {
  return (
    typeof value === 'string' && PLATFORM_ROLES.includes(value as PlatformRole)
  );
}

export function resolveAuthenticatedPrincipal(
  session: BetterAuthSession | null | undefined,
): AuthenticatedPrincipal {
  const userId = session?.user.id;
  const sessionId = session?.session.id;
  const role = session?.user.role;

  if (
    !userId ||
    !sessionId ||
    !isUuid(userId) ||
    !isUuid(sessionId) ||
    !isPlatformRole(role)
  ) {
    throw new UnauthorizedException('Authenticated principal is invalid.');
  }

  return {
    userId,
    role,
    sessionId,
  };
}

export function resolveOptionalPrincipal(
  session: BetterAuthSession | null | undefined,
): AuthenticatedPrincipal | null {
  return session ? resolveAuthenticatedPrincipal(session) : null;
}

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedPrincipal => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return resolveAuthenticatedPrincipal(request.session);
  },
);

export const CurrentOptionalPrincipal = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): AuthenticatedPrincipal | null => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return resolveOptionalPrincipal(request.session);
  },
);
