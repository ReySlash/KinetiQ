"use client";

import type { AnalyticsOverview } from "@/types/analytics-types";
import { EmptyState } from "./empty-state";
import { ExerciseDistributionPanel } from "./exercise-distribution-panel";
import { ExercisePanel } from "./exercise-panel";
import { PrimaryMetrics } from "./primary-metrics";
import { RecentWorkouts } from "./recent-workouts";
import { WeeklyPanel } from "./weekly-panel";
import type { ExerciseSortMetric } from "./exercise-analytics-utils";

export function AnalyticsContent({
  overview,
  metric,
  timezone,
}: {
  overview: AnalyticsOverview;
  metric: ExerciseSortMetric;
  timezone: string;
}) {
  if (
    overview.totals.completedWorkouts === 0 &&
    overview.exercises.length === 0
  )
    return <EmptyState />;
  return (
    <>
      <PrimaryMetrics overview={overview} />
      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <WeeklyPanel
          overview={overview}
          metric={metric}
          timezone={timezone}
        />
        <ExerciseDistributionPanel overview={overview} metric={metric} />
      </div>
      <div className="grid gap-2">
        <ExercisePanel exercises={overview.exercises} timezone={timezone} metric={metric} />
        <RecentWorkouts
          workouts={overview.recentWorkouts}
          timezone={timezone}
        />
      </div>
    </>
  );
}
