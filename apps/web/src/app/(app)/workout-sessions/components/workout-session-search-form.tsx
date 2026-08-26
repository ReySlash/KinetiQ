"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

type WorkoutSessionSearchFormProps = {
  search: string;
  searchError: string | null;
  isPending: boolean;
  onSearchChange: (value: string) => void;
  onSubmit: FormSubmitHandler;
};

export function WorkoutSessionSearchForm({
  search,
  searchError,
  isPending,
  onSearchChange,
  onSubmit,
}: WorkoutSessionSearchFormProps) {
  return (
    <form className="flex w-full flex-row gap-2" onSubmit={onSubmit}>
      <div className="flex w-full flex-col gap-1">
        <Input
          aria-label="Search workouts by routine name"
          type="search"
          placeholder="Search workouts by routine name."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <p className="text-xs text-destructive">{searchError ?? ""}</p>
      </div>
      <Button
        size="lg"
        type="submit"
        disabled={isPending}
        className="cursor-pointer"
        title="Search workouts by routine name"
      >
        Search
      </Button>
    </form>
  );
}
