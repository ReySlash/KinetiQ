import {
  calculateAnalyticsOverview,
  resolveAnalyticsOverviewQuery,
} from '../calculations/analytics-overview.calculator';
import type {
  AnalyticsOverview,
  AnalyticsOverviewQuery,
} from '../models/analytics-overview.model';
import { AnalyticsQueryPort } from '../ports/analytics-query.port';

export class GetAnalyticsOverviewUseCase {
  constructor(private readonly analytics: AnalyticsQueryPort) {}

  async execute(query: AnalyticsOverviewQuery): Promise<AnalyticsOverview> {
    const resolved = resolveAnalyticsOverviewQuery(query, new Date());
    const sessions = await this.analytics.findCompletedSessions(resolved);
    return calculateAnalyticsOverview(resolved, sessions);
  }
}
