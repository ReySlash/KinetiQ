import type {
  AnalyticsOverviewQuery,
  AnalyticsSourceSession,
} from '../models/analytics-overview.model';

export abstract class AnalyticsQueryPort {
  abstract findCompletedSessions(
    query: ResolvedAnalyticsOverviewQuery,
  ): Promise<AnalyticsSourceSession[]>;
}

export type ResolvedAnalyticsOverviewQuery = AnalyticsOverviewQuery & {
  from: Date;
  to: Date;
  includesPartialCurrentWeek: boolean;
  now?: Date;
};
