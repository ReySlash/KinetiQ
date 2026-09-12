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
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error('database readiness timeout')),
            2_000,
          );
        }),
      ]);

      return {
        status: 'ok' as const,
        database: 'up' as const,
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
      });
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }
}
