"use client";

import type { ComponentProps } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";
import {
  type ForceTypeFilterValue,
  forceTypeOptions,
  type LateralityFilterValue,
  lateralityOptions,
  type SkillLevelFilterValue,
  skillLevelOptions,
} from "./exercise-filters";
import { FilterSelectField } from "./filter-select-field";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

type FilterPopoverProps = {
  activeFiltersCount: number;
  forceType: ForceTypeFilterValue;
  laterality: LateralityFilterValue;
  skillLevel: SkillLevelFilterValue;
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onForceTypeChange: (value: ForceTypeFilterValue) => void;
  onLateralityChange: (value: LateralityFilterValue) => void;
  onSkillLevelChange: (value: SkillLevelFilterValue) => void;
  onReset: () => void;
  onSubmit: FormSubmitHandler;
};

export function FilterPopover(props: FilterPopoverProps) {
  const {
    activeFiltersCount,
    forceType,
    laterality,
    skillLevel,
    open,
    isPending,
    onOpenChange,
    onForceTypeChange,
    onLateralityChange,
    onSkillLevelChange,
    onReset,
    onSubmit,
  } = props;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        type="button"
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "gap-2 self-start",
        )}
      >
        <Filter className="size-4" />
        {activeFiltersCount > 0 ? (
          <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
            {activeFiltersCount}
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent className="space-y-4">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">Filter exercises</h2>
              <p className="text-xs text-muted-foreground">
                Narrow the catalog without leaving the page.
              </p>
            </div>
            <PopoverClose
              type="button"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "shrink-0",
              )}
            >
              <X className="size-4" />
              <span className="sr-only">Close filters</span>
            </PopoverClose>
          </div>

          <div className="space-y-3">
            <FilterSelectField
              label="Force type"
              options={forceTypeOptions}
              value={forceType}
              onValueChange={onForceTypeChange}
            />
            <FilterSelectField
              label="Laterality"
              options={lateralityOptions}
              value={laterality}
              onValueChange={onLateralityChange}
            />
            <FilterSelectField
              label="Skill level"
              options={skillLevelOptions}
              value={skillLevel}
              onValueChange={onSkillLevelChange}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onReset}>
              Reset filters
            </Button>
            <Button type="submit" disabled={isPending}>
              Apply filters
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
