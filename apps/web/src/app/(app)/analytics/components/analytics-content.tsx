import type { AnalyticsOverview } from "@/types/analytics-types";
import type { AnalyticsRange } from "@/types/analytics-types";
import { AnalyticsInteractiveContent } from "./analytics-interactive-content";
import { PrimaryMetrics } from "./primary-metrics";
import { RecentWorkouts } from "./recent-workouts";
import type { ExerciseSortMetric } from "./exercise-analytics-utils";

export function AnalyticsContent({
  overview,
  initialMetric,
  range,
  timezone,
}: {
  overview: AnalyticsOverview;
  initialMetric: ExerciseSortMetric;
  range: AnalyticsRange;
  timezone: string;
}) {
  const isEmpty =
    overview.totals.completedWorkouts === 0 &&
    overview.exercises.length === 0;

  return (
    <AnalyticsInteractiveContent
      overview={overview}
      initialMetric={initialMetric}
      range={range}
      timezone={timezone}
      isEmpty={isEmpty}
      footer={
        !isEmpty ? (
          <RecentWorkouts
            workouts={overview.recentWorkouts}
            timezone={timezone}
          />
        ) : null
      }
    >
      {!isEmpty && <PrimaryMetrics overview={overview} />}
    </AnalyticsInteractiveContent>
  );
}
