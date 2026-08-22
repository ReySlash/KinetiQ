import type { NextFunction, Request, Response } from 'express';
import type { NestMiddleware } from '@nestjs/common';

type Counter = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 60;
const SENSITIVE_LIMIT = 10;
const SENSITIVE_AUTH_PATHS = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/request-password-reset',
  '/reset-password',
  '/change-password',
  '/set-password',
  '/update-user',
  '/delete-user',
  '/send-verification-email',
  '/verify-email',
];

/**
 * Better Auth is mounted as middleware, so Nest guards do not protect it.
 * This small process-local limiter covers its credential and recovery flows.
 */
export class AuthRateLimitMiddleware implements NestMiddleware {
  private readonly counters = new Map<string, Counter>();

  use(req: Request, res: Response, next: NextFunction): void {
    const path = this.authPath(req);
    if (!path) {
      next();
      return;
    }

    const now = Date.now();
    const limit = SENSITIVE_AUTH_PATHS.some(
      (suffix) => path === suffix || path.startsWith(`${suffix}/`),
    )
      ? SENSITIVE_LIMIT
      : DEFAULT_LIMIT;
    const key = `${req.ip ?? 'unknown'}:${path}`;
    const current = this.counters.get(key);
    const counter =
      !current || current.resetAt <= now
        ? { count: 1, resetAt: now + WINDOW_MS }
        : { ...current, count: current.count + 1 };

    this.counters.set(key, counter);
    res.setHeader('RateLimit-Limit', limit);
    res.setHeader('RateLimit-Remaining', Math.max(0, limit - counter.count));
    res.setHeader('RateLimit-Reset', Math.ceil(counter.resetAt / 1000));

    if (counter.count > limit) {
      res.status(429).json({
        statusCode: 429,
        message: 'Too many authentication requests. Please try again later.',
      });
      return;
    }

    next();
  }

  private authPath(req: Request): string | null {
    const path = (req.originalUrl ?? req.url).split('?')[0];
    const marker = '/api/auth/';
    const index = path.indexOf(marker);
    return index === -1 ? null : `/${path.slice(index + marker.length)}`;
  }
}
