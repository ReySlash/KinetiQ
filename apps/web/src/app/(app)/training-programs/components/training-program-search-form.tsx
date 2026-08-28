"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

type TrainingProgramSearchFormProps = {
  search: string;
  searchError: string | null;
  isPending: boolean;
  onSearchChange: (value: string) => void;
  onSubmit: FormSubmitHandler;
};

export function TrainingProgramSearchForm({
  search,
  searchError,
  isPending,
  onSearchChange,
  onSubmit,
}: TrainingProgramSearchFormProps) {
  return (
    <form className="flex w-full flex-row gap-2" onSubmit={onSubmit}>
      <div className="flex w-full flex-col gap-1">
        <Input
          aria-label="Search training programs by name or description"
          type="search"
          placeholder="Search training programs by name or description."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <p className="text-xs text-destructive">{searchError ?? ""}</p>
      </div>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="lg"
              type="submit"
              disabled={isPending}
              className="cursor-pointer !border-primary text-primary hover:!bg-primary hover:!text-black"
            />
          }
        >
          Search
        </TooltipTrigger>
        <TooltipContent>Search training programs by name or description</TooltipContent>
      </Tooltip>
    </form>
  );
}
