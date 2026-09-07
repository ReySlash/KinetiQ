"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AnalyticsFilters } from "./analytics-ui";
import { rangeLabels } from "./analytics-ui";
import type { AnalyticsRange } from "@/types/analytics-types";

export function AnalyticsFilterBar({
  filters,
  pending,
  onChange,
}: {
  filters: AnalyticsFilters;
  pending: boolean;
  onChange: (filters: AnalyticsFilters) => void;
}) {
  return (
    <div className="shrink-0">
      <div className="flex flex-wrap items-center gap-2">
        <Field className="flex w-auto min-w-0 flex-row items-center gap-1">
          <FieldLabel htmlFor="analytics-range">Period</FieldLabel>
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <Select
                value={filters.range}
                disabled={pending}
                onValueChange={(value) => {
                  onChange({ ...filters, range: value as AnalyticsRange });
                }}
              >
                <SelectTrigger
                  id="analytics-range"
                  aria-label="Analytics period"
                  className="h-9 w-24 text-xs sm:w-28 md:w-40 md:text-sm"
                >
                  <SelectValue>{rangeLabels[filters.range]}</SelectValue>
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  alignItemWithTrigger={false}
                  collisionAvoidance={{
                    side: "none",
                    align: "shift",
                    fallbackAxisSide: "none",
                  }}
                >
                  <SelectGroup>
                    {Object.entries(rangeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </TooltipTrigger>
            <TooltipContent>Choose the analytics period</TooltipContent>
          </Tooltip>
        </Field>
      </div>
    </div>
  );
}
