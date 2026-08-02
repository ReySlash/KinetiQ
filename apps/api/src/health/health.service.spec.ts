import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HealthModule } from './health.module';
import { HealthService, type HealthDatabase } from './health.service';

describe('HealthService', () => {
  it('resolves PrismaService through the Nest module', async () => {
    const module = await Test.createTestingModule({
      imports: [HealthModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(module.get(HealthService)).toBeInstanceOf(HealthService);
  });

  it('reports the API and database as ready', async () => {
    const prisma: HealthDatabase = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };
    const service = new HealthService(prisma);

    await expect(service.checkReadiness()).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
  });

  it('reports an unavailable database as a service-unavailable error', async () => {
    const prisma: HealthDatabase = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('database offline')),
    };
    const service = new HealthService(prisma);

    await expect(service.checkReadiness()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
