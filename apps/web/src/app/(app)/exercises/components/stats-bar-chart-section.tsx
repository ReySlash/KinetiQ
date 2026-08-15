"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

type StatsBarChartSectionProps = {
  headers: string[];
  values?: (number | string | null)[];
};

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function StatsBarChartSection({
  headers,
  values,
}: StatsBarChartSectionProps) {
  const chartData = headers.flatMap((label, index) => {
    const value = values?.[index];
    const numericValue = typeof value === "number" ? value : Number(value);

    return Number.isFinite(numericValue)
      ? [{ label, value: numericValue }]
      : [];
  });

  return (
    <ChartContainer config={chartConfig} className="h-90 min-h-80 w-full ">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" domain={[0, 5]} allowDecimals={false} hide />
        <YAxis
          type="category"
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          tick={{ fill: "var(--foreground)" }}
          width={115}
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} barSize={28}>
          <LabelList
            dataKey="value"
            position="right"
            className="fill-foreground"
            fontSize={13}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
