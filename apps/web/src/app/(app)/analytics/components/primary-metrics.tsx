import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { metricDelta, volumeDelta } from "@/lib/analytics-metrics";
import type { AnalyticsOverview } from "@/types/analytics-types";
import { formatNumber, formatVolume } from "./analytics-formatters";

export function PrimaryMetrics({ overview }: { overview: AnalyticsOverview }) {
  const current = overview.totals;
  const previous = overview.comparison.totals;
  const volumeChange = volumeDelta(
    current.volumeLoadKg,
    previous.volumeLoadKg,
    overview.volumeCompleteness.status,
    overview.comparison.volumeCompleteness.status,
  );
  const metrics = [
    {
      label: "Completed workouts",
      value: formatNumber(current.completedWorkouts),
      delta: metricDelta(current.completedWorkouts, previous.completedWorkouts),
    },
    {
      label: "Working sets",
      value: formatNumber(current.completedWorkingSets),
      delta: metricDelta(
        current.completedWorkingSets,
        previous.completedWorkingSets,
      ),
    },
    {
      label: "Repetitions",
      value: formatNumber(current.totalRepetitions),
      delta: metricDelta(current.totalRepetitions, previous.totalRepetitions),
    },
    {
      label: "Volume",
      value: formatVolume(current.volumeLoadKg),
      delta: volumeChange ?? "Comparison unavailable",
      helper: "Sets × Reps × Load",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 min-[340px]:grid-cols-2 xl:grid-cols-4">
      {metrics.map((item) => (
        <Card key={item.label} className="min-w-0 py-2">
          <CardHeader className="px-4">
            <CardDescription className="flex flex-wrap items-baseline gap-x-1">
              <span>{item.label}</span>
              {"helper" in item && (
                <span className="text-xs">({item.helper})</span>
              )}
            </CardDescription>
            <CardTitle className="truncate text-2xl tabular-nums">
              {item.value}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 text-xs text-muted-foreground">
            {item.delta} vs previous period
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
