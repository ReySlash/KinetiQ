"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalyticsOverview } from "@/types/analytics-types";
import type { ExerciseSortMetric } from "./exercise-analytics-utils";
import { WeeklyChart } from "./weekly-chart";

export function WeeklyPanel({
  overview,
  metric,
  timezone,
}: {
  overview: AnalyticsOverview;
  metric: ExerciseSortMetric;
  timezone: string;
}) {
  return (
    <Card className="min-w-0 gap-1 py-2">
      <CardHeader className="px-4 pb-1 pt-2 sm:px-6 sm:pt-4">
        <CardTitle>Weekly performance</CardTitle>
        <CardDescription>
          Completed training output by local week.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 px-4 pb-2 sm:px-6 sm:pb-4">
        <WeeklyChart overview={overview} metric={metric} timezone={timezone} />
      </CardContent>
    </Card>
  );
}
