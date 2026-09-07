import type { ChartConfig } from "@/components/ui/chart";
import type { AnalyticsMetric, AnalyticsRange } from "@/types/analytics-types";

export const chartConfig = { value: { label: "Value", color: "var(--chart-1)" } } satisfies ChartConfig;

export const metricLabels: Record<AnalyticsMetric, string> = {
  workouts: "Workouts",
  sets: "Working sets",
  repetitions: "Repetitions",
  volume: "Volume",
};

export const exerciseMetricLabels = {
  sets: "Working sets",
  repetitions: "Repetitions",
  volume: "Volume",
} as const;

export const rangeLabels: Record<AnalyticsRange, string> = {
  "1w": "1 week",
  "2w": "2 weeks",
  "4w": "4 weeks",
  "26w": "26 weeks",
  "52w": "52 weeks",
};

export type AnalyticsFilters = { range: AnalyticsRange };
