"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useSyncExternalStore, useTransition } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchAnalyticsOverview } from "@/lib/analytics-api";
import { buildAnalyticsRequest } from "@/lib/analytics-range";
import type { AnalyticsRange } from "@/types/analytics-types";
import { AnalyticsContent } from "./analytics-content";
import { AnalyticsError } from "./analytics-error";
import { AnalyticsFilterBar } from "./analytics-filter-bar";
import { AnalyticsLoading } from "./analytics-loading";
import { AnalyticsMetricTabs } from "./analytics-metric-tabs";
import type { AnalyticsFilters } from "./analytics-ui";
import type { ExerciseSortMetric } from "./exercise-analytics-utils";

export { AnalyticsLoading } from "./analytics-loading";

export function AnalyticsDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [metric, setMetric] = useState<ExerciseSortMetric>("volume");
  const [isPending, startTransition] = useTransition();
  const timezone = useSyncExternalStore(
    () => () => undefined,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    () => null,
  );
  const filters = useMemo<AnalyticsFilters>(() => {
    const value = searchParams.get("range");
    const range: AnalyticsRange = ["1w", "2w", "4w", "26w", "52w"].includes(
      value ?? "",
    )
      ? (value as AnalyticsRange)
      : "4w";
    return {
      range,
    };
  }, [searchParams]);
  const requestResult = useMemo(
    () => (timezone ? buildAnalyticsRequest(timezone, filters) : null),
    [filters, timezone],
  );
  const activeRequest = requestResult?.ok ? requestResult.request : null;
  const query = useQuery({
    queryKey: ["analytics", "overview", activeRequest],
    queryFn: () => {
      if (!activeRequest) throw new Error("Analytics timezone is unavailable.");
      return fetchAnalyticsOverview(activeRequest);
    },
    enabled: Boolean(activeRequest),
    retry: false,
    placeholderData: keepPreviousData,
  });

  function updateFilters(next: AnalyticsFilters) {
    const params = new URLSearchParams();
    if (next.range !== "4w") params.set("range", next.range);
    startTransition(() =>
      router.replace(`${pathname}${params.size ? `?${params}` : ""}`),
    );
  }

  if (!timezone || (query.isLoading && !query.data))
    return <AnalyticsLoading />;
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-1 py-0 pb-14 *:shrink-0 md:gap-2 md:pb-0">
      <div className="-mb-2 flex min-w-0 flex-nowrap items-center justify-center gap-1 overflow-x-auto pb-1 md:justify-end">
        <AnalyticsFilterBar
          filters={filters}
          pending={isPending}
          onChange={updateFilters}
        />
        <AnalyticsMetricTabs metric={metric} onChange={setMetric} />
      </div>
      {requestResult && !requestResult.ok && (
        <Alert variant="destructive">
          <AlertTitle>Choose a valid range</AlertTitle>
          <AlertDescription>{requestResult.message}</AlertDescription>
        </Alert>
      )}
      {query.error && !query.data ? (
        <AnalyticsError
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : query.data ? (
        <AnalyticsContent
          overview={query.data}
          metric={metric}
          timezone={timezone}
        />
      ) : null}
    </div>
  );
}
