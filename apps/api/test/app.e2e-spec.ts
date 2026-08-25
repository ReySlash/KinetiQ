import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { apiRequest, createE2eApp } from './create-e2e-app';

describe('Application (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createE2eApp();
  });

  it('/training-programs?scope=global (GET)', async () => {
    const response = await apiRequest(app.getHttpServer())
      .get('/training-programs?scope=global')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  afterEach(async () => {
    await app.close();
  });
});
