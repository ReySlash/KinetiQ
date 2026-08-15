"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
    theme?: {
      light: string;
      dark: string;
    };
  }
>;

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig;
};

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  const cssVariables = Object.entries(config).reduce<Record<string, string>>(
    (variables, [key, value]) => {
      if (value.color) {
        variables[`--color-${key}`] = value.color;
      }

      if (value.theme) {
        variables[`--color-${key}-light`] = value.theme.light;
        variables[`--color-${key}-dark`] = value.theme.dark;
      }

      return variables;
    },
    {},
  );

  return (
    <div
      data-slot="chart"
      className={cn(
        "flex aspect-auto justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-label]:fill-foreground [&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none",
        className,
      )}
      style={cssVariables}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
