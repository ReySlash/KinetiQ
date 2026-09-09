import type { AnalyticsOverview } from "@/types/analytics-types";
import Link from "next/link";

import { CardDescription } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatDashboardNumber,
} from "./dashboard-formatters";
import { DashboardMetricCard } from "./dashboard-metric-card";

export function DashboardMetrics({ overview }: { overview: AnalyticsOverview }) {
  const { totals } = overview;
  return (
    <section aria-labelledby="dashboard-metrics-title" className="flex flex-col gap-2">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id="dashboard-metrics-title" className="text-base font-semibold">
            This week
          </h2>
          <CardDescription>A quick view of your completed training.</CardDescription>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={<span className="inline-flex shrink-0 whitespace-nowrap" />}
          >
            <Link
              href="/analytics"
              className="inline-flex whitespace-nowrap text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              View analytics
            </Link>
          </TooltipTrigger>
          <TooltipContent>Open your full training analytics</TooltipContent>
        </Tooltip>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <DashboardMetricCard
          label="Workouts"
          value={formatDashboardNumber(totals.completedWorkouts)}
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
