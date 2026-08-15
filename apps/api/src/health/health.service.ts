import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../modules/shared/infrastructure/database/prisma/prisma.service';

export interface HealthDatabase {
  $queryRaw: (
    query: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<unknown>;
}

@Injectable()
export class HealthService {
  constructor(@Inject(PrismaService) private readonly prisma: HealthDatabase) {}

  async checkReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok' as const,
        database: 'up' as const,
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
      });
    }
  }
}
