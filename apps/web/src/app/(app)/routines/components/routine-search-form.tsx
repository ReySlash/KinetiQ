"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

type RoutineSearchFormProps = {
  search: string;
  searchError: string | null;
  isPending: boolean;
  onSearchChange: (value: string) => void;
  onSubmit: FormSubmitHandler;
};

export function RoutineSearchForm({
  search,
  searchError,
  isPending,
  onSearchChange,
  onSubmit,
}: RoutineSearchFormProps) {
  return (
    <form className="flex w-full flex-row gap-2" onSubmit={onSubmit}>
      <div className="flex w-full flex-col gap-1">
        <Input
          aria-label="Search routines by name or description"
          type="search"
          placeholder="Search routines by name or description."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <p className="text-xs text-destructive">{searchError ?? ""}</p>
      </div>
      <Button
        variant="outline"
        size="lg"
        type="submit"
        disabled={isPending}
        className="cursor-pointer !border-primary text-primary hover:!bg-primary hover:!text-black"
        title="Search routines by name or description"
      >
        Search
      </Button>
    </form>
  );
}
