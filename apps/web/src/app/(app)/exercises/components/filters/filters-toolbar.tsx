"use client";

import { useSearchParams } from "next/navigation";

import {
  type ExercisesQueryParamKey,
  forceTypeOptions,
  lateralityOptions,
  normalizeFilterValue,
  normalizeSearchValue,
  skillLevelOptions,
} from "./exercise-filters";
import FiltersToolbarControls from "./filters-toolbar-controls";

function getSingleQueryValue(
  searchParams: ReturnType<typeof useSearchParams>,
  key: ExercisesQueryParamKey,
): string {
  return searchParams.get(key) ?? "";
}

export function FiltersToolbar() {
  const searchParams = useSearchParams();
  const currentSearch =
    normalizeSearchValue(getSingleQueryValue(searchParams, "search")) ?? "";
  const currentForceType = normalizeFilterValue(
    getSingleQueryValue(searchParams, "forceType"),
    forceTypeOptions,
  );
  const currentLaterality = normalizeFilterValue(
    getSingleQueryValue(searchParams, "laterality"),
    lateralityOptions,
  );
  const currentSkillLevel = normalizeFilterValue(
    getSingleQueryValue(searchParams, "skillLevel"),
    skillLevelOptions,
  );

  return (
    <FiltersToolbarControls
      key={searchParams.toString()}
      currentQueryString={searchParams.toString()}
      currentForceType={currentForceType}
      currentLaterality={currentLaterality}
      currentSearch={currentSearch}
      currentSkillLevel={currentSkillLevel}
    />
  );
}
