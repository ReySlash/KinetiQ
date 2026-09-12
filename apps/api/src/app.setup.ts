import { Logger, ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { PrismaService } from './modules/shared/infrastructure/database/prisma/prisma.service';
import { type EnvironmentVariables } from './modules/shared/infrastructure/config/env.validation';

const requestIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;

export function configureApp(app: INestApplication): void {
  const prismaService = app.get(PrismaService);
  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  const webOrigin = configService.get<string>('WEB_ORIGIN');
  const nodeEnv =
    configService.getOrThrow<EnvironmentVariables['NODE_ENV']>('NODE_ENV');
  const commitSha = configService.get<string>('COMMIT_SHA') ?? 'unknown';

  app.setGlobalPrefix('api');
  app.use((request: Request, response: Response, next: NextFunction) => {
    const suppliedRequestId = request.get('x-request-id');
    const requestId =
      suppliedRequestId && requestIdPattern.test(suppliedRequestId)
        ? suppliedRequestId
        : randomUUID();
    const startedAt = performance.now();

    response.setHeader('x-request-id', requestId);
    response.on('finish', () => {
      Logger.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          service: 'api',
          environment: nodeEnv,
          commitSha,
          route: request.path,
          method: request.method,
          status: response.statusCode,
          durationMs: Math.round(performance.now() - startedAt),
          requestId,
        }),
      );
    });
    next();
  });
  app.enableCors({
    origin: webOrigin ? [webOrigin] : false,
    credentials: true,
  });
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production',
      hsts:
        nodeEnv === 'production'
          ? { maxAge: 31_536_000, includeSubDomains: true, preload: false }
          : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.setHeader(
      'Permissions-Policy',
      'camera=(), geolocation=(), microphone=()',
    );
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('KinetiQ API')
      .setDescription('KinetiQ fitness development platform API')
      .setVersion('0.1.0')
      .addCookieAuth('better-auth.session_token')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  prismaService.enableShutdownHooks(app);
}

export function logServerStarted(port: number): void {
  Logger.log(`Server running on port ${port}`);
}
