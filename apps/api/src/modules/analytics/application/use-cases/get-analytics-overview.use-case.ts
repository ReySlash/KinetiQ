import {
  calculateAnalyticsOverview,
  resolveAnalyticsComparisonQuery,
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
    const comparisonQuery = resolveAnalyticsComparisonQuery(resolved);
    const [sessions, comparisonSessions] = await Promise.all([
      this.analytics.findCompletedSessions(resolved),
      this.analytics.findCompletedSessions(comparisonQuery),
    ]);
    const overview = calculateAnalyticsOverview(resolved, sessions);
    const comparison = calculateAnalyticsOverview(
      comparisonQuery,
      comparisonSessions,
    );
    return {
      ...overview,
      comparison: {
        period: {
          from: comparisonQuery.from.toISOString(),
          to: comparisonQuery.to.toISOString(),
        },
        totals: comparison.totals,
        volumeCompleteness: comparison.volumeCompleteness,
      },
    };
  }
}
