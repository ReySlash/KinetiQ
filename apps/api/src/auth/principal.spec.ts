import { UnauthorizedException } from '@nestjs/common';
import {
  resolveAuthenticatedPrincipal,
  type BetterAuthSession,
} from './principal';

const validSession: BetterAuthSession = {
  session: {
    id: '123e4567-e89b-12d3-a456-426614174000',
  },
  user: {
    id: '223e4567-e89b-12d3-a456-426614174000',
    role: 'USER',
  },
};

describe('resolveAuthenticatedPrincipal', () => {
  it('maps a Better Auth session to the application principal', () => {
    expect(resolveAuthenticatedPrincipal(validSession)).toEqual({
      userId: validSession.user.id,
      role: 'USER',
      sessionId: validSession.session.id,
    });
  });

  it.each([
    ['missing session', undefined],
    [
      'invalid user ID',
      { ...validSession, user: { ...validSession.user, id: 'user-1' } },
    ],
    ['invalid session ID', { ...validSession, session: { id: 'session-1' } }],
    [
      'invalid role',
      { ...validSession, user: { ...validSession.user, role: 'COACH' } },
    ],
    [
      'multiple roles',
      { ...validSession, user: { ...validSession.user, role: ['USER'] } },
    ],
  ])('%s is rejected', (_label, session) => {
    expect(() => resolveAuthenticatedPrincipal(session)).toThrow(
      UnauthorizedException,
    );
  });
});
