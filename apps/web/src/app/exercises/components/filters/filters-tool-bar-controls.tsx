"use client";
import {
  ANY_VALUE,
  type ExercisesFilterKey,
  type ExercisesQueryParamKey,
  type ForceTypeFilterValue,
  forceTypeOptions,
  getFilterLabel,
  type LateralityFilterValue,
  lateralityOptions,
  type SkillLevelFilterValue,
  skillLevelOptions,
} from "./exercise-filters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { useMemo, useState, useTransition } from "react";
import {
  type ActiveFilterChip,
  ActiveFilterChips,
} from "./active-filter-chips";
import { SearchForm } from "./search-form";
import { FilterPopover } from "./filter-popover";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;
type FormSubmitEvent = Parameters<FormSubmitHandler>[0];

type FiltersToolbarControlsProps = {
  currentSearch: string;
  currentForceType: ForceTypeFilterValue;
  currentLaterality: LateralityFilterValue;
  currentSkillLevel: SkillLevelFilterValue;
};

export default function FiltersToolbarControls(
  props: FiltersToolbarControlsProps,
) {
  const {
    currentSearch,
    currentForceType,
    currentLaterality,
    currentSkillLevel,
  } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);
  const [forceType, setForceType] = useState(currentForceType);
  const [laterality, setLaterality] = useState(currentLaterality);
  const [skillLevel, setSkillLevel] = useState(currentSkillLevel);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const activeChips = useMemo(
    () =>
      [
        currentSearch.trim().length > 0
          ? { key: "search" as const, label: `Search: ${currentSearch.trim()}` }
          : null,
        currentForceType !== ANY_VALUE
          ? {
              key: "forceType" as const,
              label: `Force type: ${getFilterLabel(currentForceType, forceTypeOptions)}`,
            }
          : null,
        currentLaterality !== ANY_VALUE
          ? {
              key: "laterality" as const,
              label: `Laterality: ${getFilterLabel(currentLaterality, lateralityOptions)}`,
            }
          : null,
        currentSkillLevel !== ANY_VALUE
          ? {
              key: "skillLevel" as const,
              label: `Skill level: ${getFilterLabel(currentSkillLevel, skillLevelOptions)}`,
            }
          : null,
      ].filter((chip): chip is ActiveFilterChip => chip !== null),
    [currentForceType, currentLaterality, currentSearch, currentSkillLevel],
  );

  function pushQuery(
    updates: Partial<Record<ExercisesQueryParamKey, string | undefined>>,
  ) {
    const nextParams = new URLSearchParams(searchParams.toString());

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

  function handleClearChip(key: ExercisesFilterKey) {
    if (key === "search") {
      setSearch("");
      setSearchError(null);
      pushQuery({ search: undefined });
      return;
    }

    if (key === "forceType") {
      setForceType(ANY_VALUE);
      pushQuery({ forceType: undefined });
      return;
    }

    if (key === "laterality") {
      setLaterality(ANY_VALUE);
      pushQuery({ laterality: undefined });
      return;
    }

    setSkillLevel(ANY_VALUE);
    pushQuery({ skillLevel: undefined });
  }

  function handleClearAll() {
    setSearch("");
    setForceType(ANY_VALUE);
    setLaterality(ANY_VALUE);
    setSkillLevel(ANY_VALUE);
    setSearchError(null);
    pushQuery({
      search: undefined,
      forceType: undefined,
      laterality: undefined,
      skillLevel: undefined,
    });
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border/70 p-2 md:p-3">
      <div className="flex gap-2 flex-row justify-start">
        <SearchForm
          search={search}
          searchError={searchError}
          isPending={isPending}
          onSearchChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
        />
        <FilterPopover
          activeFiltersCount={activeChips.length}
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

      <ActiveFilterChips
        chips={activeChips}
        onClearChip={handleClearChip}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
