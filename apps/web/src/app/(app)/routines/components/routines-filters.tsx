"use client";

import type { ComponentProps } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterSelectField } from "../../exercises/components/filters/filter-select-field";
import { RoutineSearchForm } from "./routine-search-form";

export const routineSortOptions = [
  { label: "Recently updated", value: "updatedAt:desc" },
  { label: "Oldest updated", value: "updatedAt:asc" },
  { label: "Name A–Z", value: "name:asc" },
  { label: "Name Z–A", value: "name:desc" },
] as const;

export type RoutineSortValue = (typeof routineSortOptions)[number]["value"];
type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

function normalizeSearch(value: string) {
  const normalized = value.trim();
  return normalized.length >= 3 ? normalized : "";
}

function normalizeSort(value: string): RoutineSortValue {
  return routineSortOptions.some((option) => option.value === value)
    ? (value as RoutineSortValue)
    : "updatedAt:desc";
}

type RoutinesFiltersControlsProps = {
  currentQueryString: string;
  currentSearch: string;
  currentSort: RoutineSortValue;
};

function RoutinesFiltersControls({
  currentQueryString,
  currentSearch,
  currentSort,
}: RoutinesFiltersControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);
  const [sort, setSort] = useState(currentSort);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  function pushQuery(updates: { q?: string; sort?: string }) {
    const nextParams = new URLSearchParams(currentQueryString);

    for (const [key, value] of Object.entries(updates)) {
      if (!value || (key === "sort" && value === "updatedAt:desc")) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    }

    const queryString = nextParams.toString();
    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
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
      <RoutineSearchForm
        search={search}
        searchError={searchError}
        isPending={isPending}
        onSearchChange={(value) => {
          setSearch(value);
          if (searchError && (value.trim().length === 0 || value.trim().length >= 3)) {
            setSearchError(null);
          }
        }}
        onSubmit={handleSearchSubmit}
      />
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          type="button"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "cursor-pointer gap-2 self-start")}
          title="Filter routines"
          aria-label="Filter routines"
        >
          <Filter className="size-4" />
          {currentSort !== "updatedAt:desc" ? (
            <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">1</span>
          ) : null}
        </PopoverTrigger>
        <PopoverContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleApplyFilters}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1"><h2 className="text-sm font-medium">Filter routines</h2><p className="text-xs text-muted-foreground">Sort your routines without leaving the page.</p></div>
              <PopoverClose type="button" className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "shrink-0")}><X className="size-4" /><span className="sr-only">Close filters</span></PopoverClose>
            </div>
            <FilterSelectField label="Sort by" options={routineSortOptions} value={sort} onValueChange={setSort} />
            <div className="flex items-center justify-between gap-2"><Button type="button" variant="ghost" size="sm" onClick={handleResetFilters}>Reset filters</Button><Button type="submit" disabled={isPending}>Apply filters</Button></div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function RoutinesFilters() {
  const searchParams = useSearchParams();
  const currentSearch = normalizeSearch(searchParams.get("q") ?? "");
  const currentSort = normalizeSort(searchParams.get("sort") ?? "");

  return (
    <RoutinesFiltersControls
      key={searchParams.toString()}
      currentQueryString={searchParams.toString()}
      currentSearch={currentSearch}
      currentSort={currentSort}
    />
  );
}
