"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

type SearchFormProps = {
  search: string;
  searchError: string | null;
  isPending: boolean;
  ariaLabel?: string;
  placeholder?: string;
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
      <Button
        size="lg"
        type="submit"
        disabled={isPending}
        className="cursor-pointer"
        title="Search exercises"
      >
        Search
      </Button>
    </form>
  );
}
