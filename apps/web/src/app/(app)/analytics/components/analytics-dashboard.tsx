import type {
  AnalyticsOverview,
  AnalyticsRange,
} from "@/types/analytics-types";
import { AnalyticsContent } from "./analytics-content";
import { AnalyticsError } from "./analytics-error";
import type { ExerciseSortMetric } from "./exercise-analytics-utils";

export { AnalyticsLoading } from "./analytics-loading";

type AnalyticsDashboardProps = {
  overview: AnalyticsOverview | null;
  range: AnalyticsRange;
  metric: ExerciseSortMetric;
  timezone: string;
  failure?: { status: number; message: string };
};

export function AnalyticsDashboard(props: AnalyticsDashboardProps) {
  const { overview, range, metric, timezone, failure } = props;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-1 py-0 pb-14 *:shrink-0 md:gap-2 md:pb-0">
      {failure ? (
        <AnalyticsError status={failure.status} message={failure.message} />
      ) : overview ? (
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
