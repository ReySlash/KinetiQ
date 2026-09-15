import type { ReactNode } from "react";

import type { AnalyticsOverview } from "@/types/analytics-types";
import { DashboardAnalyticsError } from "./dashboard-analytics-error";
import { DashboardAnalyticsLoading } from "./dashboard-analytics-loading";
import { DashboardMetrics } from "./dashboard-metrics";
import { DashboardRecentWorkouts } from "./dashboard-recent-workouts";

export function DashboardAnalytics({ children, overview, timezone, failure }: {
  children: ReactNode;
  overview: AnalyticsOverview | null;
  timezone: string | null;
  failure?: { status: number; message: string };
}) {
  if (!timezone) return <DashboardAnalyticsLoading>{children}</DashboardAnalyticsLoading>;
  if (failure) {
    return (
      <div className="flex flex-col gap-2">
        <DashboardAnalyticsError status={failure.status} />
        {children}
      </div>
    );
  }
  if (!overview) return <DashboardAnalyticsLoading>{children}</DashboardAnalyticsLoading>;

  return (
    <div className="flex flex-col gap-2">
      <DashboardMetrics overview={overview} />
      {children}
      <DashboardRecentWorkouts workouts={overview.recentWorkouts} timezone={timezone} />
    </div>
  );
}
