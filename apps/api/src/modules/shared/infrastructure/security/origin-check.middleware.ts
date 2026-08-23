import type { NextFunction, Request, Response } from 'express';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../config/env.validation';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class OriginCheckMiddleware implements NestMiddleware {
  private readonly allowedOrigins: ReadonlySet<string>;

  constructor(configService: ConfigService<EnvironmentVariables, true>) {
    const apiUrl =
      configService.get<string>('BETTER_AUTH_URL') ??
      `http://localhost:${configService.get<number>('PORT')}`;
    const webOrigin = configService.get<string>('WEB_ORIGIN');
    this.allowedOrigins = new Set(
      [apiUrl, webOrigin]
        .filter((value): value is string => Boolean(value))
        .map((value) => new URL(value).origin),
    );
  }

  use(req: Request, res: Response, next: NextFunction): void {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }

    const origin = req.get('origin');
    if (!origin || this.allowedOrigins.has(origin)) {
      next();
      return;
    }

    res.status(403).json({
      statusCode: 403,
      message: 'Request origin is not allowed.',
    });
  }
}
