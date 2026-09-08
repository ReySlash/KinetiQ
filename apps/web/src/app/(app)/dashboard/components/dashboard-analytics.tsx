"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type ReactNode, useMemo, useSyncExternalStore } from "react";

import { fetchAnalyticsOverview } from "@/lib/analytics-api";
import { buildAnalyticsRequest } from "@/lib/analytics-range";
import { DashboardAnalyticsError } from "./dashboard-analytics-error";
import { DashboardAnalyticsLoading } from "./dashboard-analytics-loading";
import { DashboardMetrics } from "./dashboard-metrics";
import { DashboardRecentWorkouts } from "./dashboard-recent-workouts";

export function DashboardAnalytics({ children }: { children: ReactNode }) {
  const timezone = useSyncExternalStore(
    () => () => undefined,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    () => null,
  );
  const requestResult = useMemo(
    () => (timezone ? buildAnalyticsRequest(timezone, { range: "1w" }) : null),
    [timezone],
  );
  const activeRequest = requestResult?.ok ? requestResult.request : null;
  const query = useQuery({
    queryKey: ["analytics", "dashboard", activeRequest],
    queryFn: () => {
      if (!activeRequest) throw new Error("Analytics timezone is unavailable.");
      return fetchAnalyticsOverview(activeRequest);
    },
    enabled: Boolean(activeRequest),
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: false,
    placeholderData: keepPreviousData,
  });

  if (!timezone || (query.isLoading && !query.data)) {
    return <DashboardAnalyticsLoading>{children}</DashboardAnalyticsLoading>;
  }

  if (query.error && !query.data) {
    return (
      <div className="flex flex-col gap-2">
        <DashboardAnalyticsError onRetry={() => void query.refetch()} />
        {children}
      </div>
    );
  }

  if (!query.data) {
    return <DashboardAnalyticsLoading>{children}</DashboardAnalyticsLoading>;
  }

  return (
    <div className="flex flex-col gap-2">
      <DashboardMetrics overview={query.data} />
      {children}
      <DashboardRecentWorkouts
        workouts={query.data.recentWorkouts}
        timezone={timezone}
      />
    </div>
  );
}
