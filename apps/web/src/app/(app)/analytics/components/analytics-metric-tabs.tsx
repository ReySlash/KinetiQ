"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExerciseSortMetric } from "./exercise-analytics-utils";

const labels: Record<ExerciseSortMetric, string> = {
  sets: "Sets",
  repetitions: "Reps",
  volume: "Total Volume",
};

export function AnalyticsMetricTabs({ metric, onChange }: { metric: ExerciseSortMetric; onChange: (metric: ExerciseSortMetric) => void }) {
  function handleChange(value: string) {
    if (value === "sets" || value === "repetitions" || value === "volume") {
      onChange(value);
    }
  }

  return (
    <Tabs value={metric} onValueChange={handleChange}>
      <TabsList className="h-9 min-w-max">
        <Tooltip>
          <TooltipTrigger
            render={<TabsTrigger className="h-8 px-2 text-xs md:h-9 md:px-3 md:text-sm" value="sets" />}
          >
            {labels.sets}
          </TooltipTrigger>
          <TooltipContent>Sort by completed sets</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <TabsTrigger className="h-8 px-2 text-xs md:h-9 md:px-3 md:text-sm" value="repetitions" />
            }
          >
            {labels.repetitions}
          </TooltipTrigger>
          <TooltipContent>Sort by completed repetitions</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={<TabsTrigger className="h-8 px-2 text-xs md:h-9 md:px-3 md:text-sm" value="volume" />}
          >
            {labels.volume}
          </TooltipTrigger>
          <TooltipContent>Sort by total volume</TooltipContent>
        </Tooltip>
      </TabsList>
    </Tabs>
  );
}
