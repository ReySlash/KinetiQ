import type { AnalyticsOverview } from "@/types/analytics-types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { CardDescription } from "@/components/ui/card";
import {
  formatDashboardNumber,
  formatDashboardVolume,
  formatDashboardVolumeStatus,
} from "./dashboard-formatters";
import { DashboardMetricCard } from "./dashboard-metric-card";

export function DashboardMetrics({ overview }: { overview: AnalyticsOverview }) {
  const { totals, volumeCompleteness } = overview;
  return (
    <section aria-labelledby="dashboard-metrics-title" className="flex flex-col gap-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="dashboard-metrics-title" className="text-base font-semibold">
            This week
          </h2>
          <CardDescription>A quick view of your completed training.</CardDescription>
        </div>
        <Link
          href="/analytics"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          View analytics
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <DashboardMetricCard
          label="Workouts"
          value={formatDashboardNumber(totals.completedWorkouts)}
        />
        <DashboardMetricCard
          label="Volume"
          value={formatDashboardVolume(totals.volumeLoadKg)}
          detail={formatDashboardVolumeStatus(volumeCompleteness) ?? undefined}
        />
        <DashboardMetricCard
          label="Sets"
          value={formatDashboardNumber(totals.completedWorkingSets)}
        />
        <DashboardMetricCard
          label="Reps"
          value={formatDashboardNumber(totals.totalRepetitions)}
        />
      </div>
    </section>
  );
}
