"use client";

import type { ComponentProps } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Filter, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FilterSelectField } from "../../exercises/components/filters/filter-select-field";
import { TrainingProgramSearchForm } from "./training-program-search-form";
import type { TrainingProgramSort } from "@/types/training-program-types";

const sortOptions = [
  { label: "Recently updated", value: "updatedAt:desc" },
  { label: "Oldest updated", value: "updatedAt:asc" },
  { label: "Name A–Z", value: "name:asc" },
  { label: "Name Z–A", value: "name:desc" },
] satisfies { label: string; value: TrainingProgramSort }[];

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

function normalizeSearch(value: string) {
  const normalized = value.trim();
  return normalized.length >= 3 ? normalized : "";
}

function normalizeSort(value: string): TrainingProgramSort {
  return sortOptions.some((option) => option.value === value)
    ? (value as TrainingProgramSort)
    : "updatedAt:desc";
}

export function TrainingProgramsFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentSearch = normalizeSearch(searchParams.get("q") ?? "");
  const currentSort = normalizeSort(searchParams.get("sort") ?? "");
  const [search, setSearch] = useState(currentSearch);
  const [sort, setSort] = useState(currentSort);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  function pushQuery(updates: { q?: string; sort?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || (key === "sort" && value === "updatedAt:desc")) params.delete(key);
      else params.set(key, value);
    }
    params.delete("offset");
    const queryString = params.toString();
    startTransition(() => router.push(queryString ? `${pathname}?${queryString}` : pathname));
  }

  function handleSearchSubmit(event: Parameters<FormSubmitHandler>[0]) {
    event.preventDefault();
    const normalizedSearch = search.trim();
    if (normalizedSearch.length > 0 && normalizedSearch.length < 3) {
      setSearchError("Search must be at least 3 characters long.");
      return;
    }
    setSearchError(null);
    pushQuery({ q: normalizedSearch });
  }

  function handleApplyFilters(event: Parameters<FormSubmitHandler>[0]) {
    event.preventDefault();
    pushQuery({ sort });
    setPopoverOpen(false);
  }

  function handleResetFilters() {
    setSort("updatedAt:desc");
    pushQuery({ sort: undefined });
    setPopoverOpen(false);
  }

  return (
    <div className="flex flex-row justify-end gap-2">
        <TrainingProgramSearchForm
          search={search}
          searchError={searchError}
          isPending={isPending}
          onSearchChange={(value) => {
            setSearch(value);
            if (searchError && (value.trim().length === 0 || value.trim().length >= 3)) setSearchError(null);
          }}
          onSubmit={handleSearchSubmit}
        />
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger type="button" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "cursor-pointer gap-2 self-start")} title="Filter training programs" aria-label="Filter training programs">
            <Filter className="size-4" />
            {currentSort !== "updatedAt:desc" ? <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">1</span> : null}
          </PopoverTrigger>
          <PopoverContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleApplyFilters}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1"><h2 className="text-sm font-medium">Filter programs</h2><p className="text-xs text-muted-foreground">Sort your programs without leaving the page.</p></div>
                <PopoverClose type="button" className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "shrink-0")}><X className="size-4" /><span className="sr-only">Close filters</span></PopoverClose>
              </div>
              <FilterSelectField label="Sort by" options={sortOptions} value={sort} onValueChange={(value) => setSort(value as TrainingProgramSort)} />
              <div className="flex items-center justify-between gap-2"><Button type="button" variant="ghost" size="sm" onClick={handleResetFilters}>Reset filters</Button><Button type="submit" disabled={isPending}>Apply filters</Button></div>
            </form>
          </PopoverContent>
        </Popover>
    </div>
  );
}
