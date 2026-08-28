"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

type SearchFormProps = {
  search: string;
  searchError: string | null;
  isPending: boolean;
  ariaLabel?: string;
  placeholder?: string;
  submitTitle?: string;
  onSearchChange: (value: string) => void;
  onSubmit: FormSubmitHandler;
};

export function SearchForm(props: SearchFormProps) {
  const {
    search,
    searchError,
    isPending,
    ariaLabel = "Search exercises",
    placeholder = "Search by name, or related muscles.",
    submitTitle = "Search exercises",
    onSearchChange,
    onSubmit,
  } = props;

  return (
    <form className="flex gap-2 flex-row w-full md:w-1/2" onSubmit={onSubmit}>
      <div className="flex w-full flex-col gap-1">
        <Input
          aria-label={ariaLabel}
          type="search"
          placeholder={placeholder}
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
        <TooltipContent>{submitTitle}</TooltipContent>
      </Tooltip>
    </form>
  );
}
