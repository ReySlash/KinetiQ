import type {
  AnalyticsOverview,
  AnalyticsRange,
} from "@/types/analytics-types";
import { AnalyticsContent } from "./analytics-content";
import type { ExerciseSortMetric } from "./exercise-analytics-utils";

export { AnalyticsLoading } from "./analytics-loading";

type AnalyticsDashboardProps = {
  overview: AnalyticsOverview | null;
  range: AnalyticsRange;
  metric: ExerciseSortMetric;
  timezone: string;
};

export function AnalyticsDashboard(props: AnalyticsDashboardProps) {
  const { overview, range, metric, timezone } = props;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-1 py-0 pb-14 *:shrink-0 md:gap-2 md:pb-0">
      {overview ? (
        <AnalyticsContent
          overview={overview}
          initialMetric={metric}
          range={range}
          timezone={timezone}
        />
      ) : null}
    </div>
  );
}
