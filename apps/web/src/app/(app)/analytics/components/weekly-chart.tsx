import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer } from "@/components/ui/chart";
import type { AnalyticsOverview } from "@/types/analytics-types";
import { chartConfig, metricLabels } from "./analytics-ui";
import { formatChartValue, formatWeekLabel } from "./analytics-formatters";
import { formatDateKey } from "@/lib/analytics-range";
import type { ExerciseSortMetric } from "./exercise-analytics-utils";

export function WeeklyChart({
  overview,
  metric,
  timezone,
}: {
  overview: AnalyticsOverview;
  metric: ExerciseSortMetric;
  timezone: string;
}) {
  const data = overview.weekly.map((week) => ({
    ...week,
    label: formatWeekLabel(week.weekStart, week.weekEnd, timezone),
    value:
      metric === "sets"
        ? week.completedWorkingSets
        : metric === "repetitions"
          ? week.totalRepetitions
          : week.volumeLoadKg === null
            ? null
            : Number(week.volumeLoadKg),
  }));

  return (
    <div className="flex flex-col gap-1">
      <ChartContainer
        config={chartConfig}
        initialDimension={{ width: 640, height: 240 }}
        className="h-60 min-h-60 min-w-0 w-full sm:h-64 sm:min-h-64"
      >
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
        >
          <defs>
            <linearGradient
              id="weekly-performance-fill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="var(--color-value)"
                stopOpacity={0.32}
              />
              <stop
                offset="100%"
                stopColor="var(--color-value)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="weekStart"
            minTickGap={24}
            tickFormatter={(value) =>
              formatDateKey(String(value), timezone).replace(/, \d{4}/, "")
            }
          />
          <YAxis
            allowDecimals={metric === "volume"}
            tickFormatter={(value) => formatChartValue(Number(value), metric)}
            width={42}
          />
          <RechartsTooltip
            labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ""}
            formatter={(value) => [
              metric === "volume" ? `${value} kg` : value,
              metricLabels[metric],
            ]}
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              color: "var(--foreground)",
              boxShadow: "0 8px 24px oklch(0 0 0 / 20%)",
            }}
            labelStyle={{
              color: "var(--muted-foreground)",
              marginBottom: "0.25rem",
            }}
            itemStyle={{ color: "var(--foreground)", padding: 0 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2.5}
            fill="url(#weekly-performance-fill)"
            fillOpacity={1}
            dot={{ r: 3, fill: "var(--color-value)" }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ChartContainer>
      <p className="text-sm text-muted-foreground">
        {metricLabels[metric]} across {data.length} local{" "}
        {data.length === 1 ? "week" : "weeks"}.
      </p>
      <table className="sr-only">
        <caption>Weekly {metricLabels[metric].toLowerCase()}</caption>
        <thead>
          <tr>
            <th>Week</th>
            <th>{metricLabels[metric]}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.weekStart}>
              <td>{item.label}</td>
              <td>
                {metric === "volume" && item.volumeLoadKg === null
                  ? "Not available"
                  : item.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
