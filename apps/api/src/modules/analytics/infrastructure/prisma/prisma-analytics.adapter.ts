import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';
import { AnalyticsQueryError } from '../../application/errors/analytics.errors';
import type { AnalyticsSourceSession } from '../../application/models/analytics-overview.model';
import { AnalyticsQueryPort } from '../../application/ports/analytics-query.port';
import type { ResolvedAnalyticsOverviewQuery } from '../../application/ports/analytics-query.port';
import {
  analyticsOverviewSelect,
  toAnalyticsSourceSession,
} from './prisma-analytics.mapper';

@Injectable()
export class PrismaAnalyticsAdapter implements AnalyticsQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findCompletedSessions(
    query: ResolvedAnalyticsOverviewQuery,
  ): Promise<AnalyticsSourceSession[]> {
    try {
      const rows = await this.prisma.workoutSession.findMany({
        where: {
          ownerId: query.ownerId,
          status: 'COMPLETED',
          startedAt: { gte: query.from, lte: query.to },
        },
        orderBy: [{ startedAt: 'asc' }, { id: 'asc' }],
        select: analyticsOverviewSelect,
      });
      return rows.map(toAnalyticsSourceSession);
    } catch {
      throw new AnalyticsQueryError();
    }
  }
}
