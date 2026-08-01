"use client";

import { useSearchParams } from "next/navigation";

import {
  type ExercisesQueryParamKey,
  forceTypeOptions,
  lateralityOptions,
  normalizeFilterValue,
  skillLevelOptions,
} from "./exercise-filters";
import FiltersToolbarControls from "./filters-tool-bar-controls";

function getSingleQueryValue(
  searchParams: ReturnType<typeof useSearchParams>,
  key: ExercisesQueryParamKey,
): string {
  return searchParams.get(key) ?? "";
}

export function FiltersToolbar() {
  const searchParams = useSearchParams();
  const currentSearch = getSingleQueryValue(searchParams, "search");
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
      currentForceType={currentForceType}
      currentLaterality={currentLaterality}
      currentSearch={currentSearch}
      currentSkillLevel={currentSkillLevel}
    />
  );
}
