"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import type { AnalyticsOverview, AnalyticsRange } from "@/types/analytics-types";
import { AnalyticsFilterBar } from "./analytics-filter-bar";
import { AnalyticsMetricTabs } from "./analytics-metric-tabs";
import { ExerciseDistributionPanel } from "./exercise-distribution-panel";
import { ExercisePanel } from "./exercise-panel";
import { EmptyState } from "./empty-state";
import type { ExerciseSortMetric } from "./exercise-analytics-utils";
import { WeeklyPanel } from "./weekly-panel";
import type { AnalyticsFilters } from "./analytics-ui";

export function AnalyticsInteractiveContent({
  overview,
  initialMetric,
  range,
  timezone,
  isEmpty,
  children,
  footer,
}: {
  overview: AnalyticsOverview;
  initialMetric: ExerciseSortMetric;
  range: AnalyticsRange;
  timezone: string;
  isEmpty: boolean;
  children: ReactNode;
  footer: ReactNode;
}) {
  const router = useRouter();
  const [metric, setMetric] = useState(initialMetric);
  const [isPending, startTransition] = useTransition();

  function updateRange({ range: nextRange }: AnalyticsFilters) {
    const params = new URLSearchParams();
    if (nextRange !== "4w") params.set("range", nextRange);
    if (metric !== "volume") params.set("metric", metric);

    startTransition(() => {
      router.replace(`/analytics${params.size ? `?${params}` : ""}`);
    });
  }

  return (
    <>
      <div className="-mx-1 -mb-2 flex min-w-0 flex-nowrap items-center justify-center gap-1 overflow-x-auto pb-1 md:justify-end">
        <AnalyticsFilterBar
          filters={{ range }}
          pending={isPending}
          onChange={updateRange}
        />
        <AnalyticsMetricTabs metric={metric} onChange={setMetric} />
      </div>
      {children}
      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <WeeklyPanel overview={overview} metric={metric} timezone={timezone} />
            <ExerciseDistributionPanel overview={overview} metric={metric} />
          </div>
          <ExercisePanel
            exercises={overview.exercises}
            timezone={timezone}
            metric={metric}
          />
        </>
      )}
      {footer}
    </>
  );
}
