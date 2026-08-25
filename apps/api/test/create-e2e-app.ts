import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

export async function createE2eApp(): Promise<INestApplication<App>> {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  configureApp(app);
  await app.init();
  return app;
}

function withApiPrefix(path: string): string {
  return path.startsWith('/api/') ? path : `/api${path}`;
}

export function apiRequest(server: App) {
  const client = supertest(server);

  return {
    ...client,
    get: (path: string) => client.get(withApiPrefix(path)),
    post: (path: string) => client.post(withApiPrefix(path)),
    patch: (path: string) => client.patch(withApiPrefix(path)),
    delete: (path: string) => client.delete(withApiPrefix(path)),
  };
}
