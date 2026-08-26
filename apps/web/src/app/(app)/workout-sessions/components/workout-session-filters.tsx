"use client";

import type { ComponentProps } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Filter, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FilterSelectField } from "../../exercises/components/filters/filter-select-field";
import { WorkoutSessionSearchForm } from "./workout-session-search-form";

const statusOptions = [
  { label: "All workouts", value: "all" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export function WorkoutSessionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [isPending, startTransition] = useTransition();
  const [searchError, setSearchError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  function applyQuery(updates: {
    q?: string;
    status?: string;
    from?: string;
    to?: string;
  }) {
    const next = new URLSearchParams(searchParams.toString());
    if (updates.q) next.set("q", updates.q);
    else if (updates.q === "") next.delete("q");
    if (updates.status === "all") next.delete("status");
    else if (updates.status) next.set("status", updates.status);
    if (updates.from) next.set("from", updates.from);
    else if (updates.from === "") next.delete("from");
    if (updates.to) next.set("to", updates.to);
    else if (updates.to === "") next.delete("to");

    startTransition(() =>
      router.push(next.toString() ? `${pathname}?${next}` : pathname),
    );
  }

  function handleSearchSubmit(event: Parameters<FormSubmitHandler>[0]) {
    event.preventDefault();
    const normalizedSearch = search.trim();
    if (normalizedSearch.length > 0 && normalizedSearch.length < 3) {
      setSearchError("Search must be at least 3 characters long.");
      return;
    }
    setSearchError(null);
    applyQuery({ q: normalizedSearch });
  }

  function handleApplyFilters(event: Parameters<FormSubmitHandler>[0]) {
    event.preventDefault();
    applyQuery({ status, from, to });
    setPopoverOpen(false);
  }

  function handleResetFilters() {
    setStatus("all");
    setFrom("");
    setTo("");
    applyQuery({ status: "all", from: "", to: "" });
    setPopoverOpen(false);
  }

  return (
    <div className="flex flex-row justify-end gap-2">
        <WorkoutSessionSearchForm
          search={search}
          searchError={searchError}
          isPending={isPending}
        onSearchChange={(value) => {
          setSearch(value);
          if (
            searchError &&
            (value.trim().length === 0 || value.trim().length >= 3)
          ) {
            setSearchError(null);
          }
        }}
        onSubmit={handleSearchSubmit}
      />
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          type="button"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "cursor-pointer gap-2 self-start",
          )}
          title="Filter workouts"
          aria-label="Filter workouts"
        >
          <Filter className="size-4" />
          {Number(status !== "all") +
            Number(Boolean(from)) +
            Number(Boolean(to)) >
          0 ? (
            <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
              {Number(status !== "all") +
                Number(Boolean(from)) +
                Number(Boolean(to))}
            </span>
          ) : null}
        </PopoverTrigger>
        <PopoverContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleApplyFilters}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-sm font-medium">Filter workouts</h2>
                <p className="text-xs text-muted-foreground">
                  Narrow your workout history without leaving the page.
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
            <FilterSelectField
              label="Status"
              options={statusOptions}
              value={
                statusOptions.some((option) => option.value === status)
                  ? status
                  : "all"
              }
              onValueChange={setStatus}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="workout-from">From date</Label>
                <Input
                  id="workout-from"
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workout-to">To date</Label>
                <Input
                  id="workout-to"
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
              >
                Reset filters
              </Button>
              <Button type="submit" disabled={isPending}>
                Apply filters
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
