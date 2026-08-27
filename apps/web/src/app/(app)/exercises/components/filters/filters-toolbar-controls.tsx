"use client";
import {
  ANY_VALUE,
  type ExercisesQueryParamKey,
  type ForceTypeFilterValue,
  type LateralityFilterValue,
  type SkillLevelFilterValue,
} from "./exercise-filters";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useState, useTransition } from "react";
import { SearchForm } from "./search-form";
import { FilterPopover } from "./filter-popover";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;
type FormSubmitEvent = Parameters<FormSubmitHandler>[0];

type FiltersToolbarControlsProps = {
  currentQueryString: string;
  currentSearch: string;
  currentForceType: ForceTypeFilterValue;
  currentLaterality: LateralityFilterValue;
  currentSkillLevel: SkillLevelFilterValue;
};

export default function FiltersToolbarControls(
  props: FiltersToolbarControlsProps,
) {
  const {
    currentQueryString,
    currentSearch,
    currentForceType,
    currentLaterality,
    currentSkillLevel,
  } = props;

  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);
  const [forceType, setForceType] = useState(currentForceType);
  const [laterality, setLaterality] = useState(currentLaterality);
  const [skillLevel, setSkillLevel] = useState(currentSkillLevel);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  function pushQuery(
    updates: Partial<Record<ExercisesQueryParamKey, string | undefined>>,
  ) {
    const nextParams = new URLSearchParams(currentQueryString);

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        nextParams.delete(key);
        continue;
      }

      nextParams.set(key, value);
    }

    nextParams.delete("page");

    const queryString = nextParams.toString();

    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  function handleSearchChange(nextValue: string) {
    setSearch(nextValue);

    if (
      searchError &&
      (nextValue.trim().length === 0 || nextValue.trim().length >= 3)
    ) {
      setSearchError(null);
    }
  }

  function handleSearchSubmit(event: FormSubmitEvent) {
    event.preventDefault();

    const normalizedSearch = search.trim();

    if (normalizedSearch.length > 0 && normalizedSearch.length < 3) {
      setSearchError("Search must be at least 3 characters long.");
      return;
    }

    setSearchError(null);
    pushQuery({
      search: normalizedSearch || undefined,
    });
  }

  function handleApplyFilters(event: FormSubmitEvent) {
    event.preventDefault();

    pushQuery({
      forceType: forceType === ANY_VALUE ? undefined : forceType,
      laterality: laterality === ANY_VALUE ? undefined : laterality,
      skillLevel: skillLevel === ANY_VALUE ? undefined : skillLevel,
    });

    setPopoverOpen(false);
  }

  function handleResetFilters() {
    setForceType(ANY_VALUE);
    setLaterality(ANY_VALUE);
    setSkillLevel(ANY_VALUE);
    pushQuery({
      forceType: undefined,
      laterality: undefined,
      skillLevel: undefined,
    });
    setPopoverOpen(false);
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border/70 bg-background/30 p-2">
      <div className="flex flex-row justify-end gap-2">
        <SearchForm
          search={search}
          searchError={searchError}
          isPending={isPending}
          onSearchChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
        />
        <FilterPopover
          activeFiltersCount={
            [currentForceType, currentLaterality, currentSkillLevel].filter(
              (value) => value !== ANY_VALUE,
            ).length
          }
          forceType={forceType}
          laterality={laterality}
          skillLevel={skillLevel}
          open={popoverOpen}
          isPending={isPending}
          onOpenChange={setPopoverOpen}
          onForceTypeChange={setForceType}
          onLateralityChange={setLaterality}
          onSkillLevelChange={setSkillLevel}
          onReset={handleResetFilters}
          onSubmit={handleApplyFilters}
        />
      </div>
    </div>
  );
}
