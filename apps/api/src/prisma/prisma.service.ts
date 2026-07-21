import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { Pool, type PoolConfig } from 'pg';
import { type EnvironmentVariables } from '../config/env.validation';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor(configService: ConfigService<EnvironmentVariables, true>) {
    const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
    const poolConfig: PoolConfig = { connectionString: databaseUrl };
    const pool = new Pool(poolConfig);
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }

  enableShutdownHooks(app: INestApplication): void {
    app.enableShutdownHooks();
  }
}
