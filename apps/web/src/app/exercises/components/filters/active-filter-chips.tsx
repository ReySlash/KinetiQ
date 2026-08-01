"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ExercisesFilterKey } from "./exercise-filters";

export type ActiveFilterChip = {
  key: ExercisesFilterKey;
  label: string;
};

type ActiveFilterChipsProps = {
  chips: ActiveFilterChip[];
  onClearChip: (key: ExercisesFilterKey) => void;
  onClearAll: () => void;
};

export function ActiveFilterChips(props: ActiveFilterChipsProps) {
  const { chips, onClearChip, onClearAll } = props;

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="outline"
          className="gap-1.5 rounded-full px-2 py-1"
        >
          <span>{chip.label}</span>
          <button
            aria-label={`Remove ${chip.key}`}
            className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            type="button"
            onClick={() => onClearChip(chip.key)}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}
