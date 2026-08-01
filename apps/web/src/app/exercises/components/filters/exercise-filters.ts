export const ANY_VALUE = "ANY";

export const forceTypeOptions = [
  { label: "Any force type", value: ANY_VALUE },
  { label: "Push", value: "PUSH" },
  { label: "Pull", value: "PULL" },
  { label: "Static", value: "STATIC" },
] as const;

export const lateralityOptions = [
  { label: "Any laterality", value: ANY_VALUE },
  { label: "Bilateral", value: "BILATERAL" },
  { label: "Unilateral", value: "UNILATERAL" },
  { label: "Alternating", value: "ALTERNATING" },
] as const;

export const skillLevelOptions = [
  { label: "Any skill level", value: ANY_VALUE },
  { label: "Beginner", value: "BEGINNER" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Advanced", value: "ADVANCED" },
] as const;

type Option = {
  label: string;
  value: string;
};

type OptionValue<TOptions extends readonly Option[]> = TOptions[number]["value"];

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export type ExercisesFilterKey =
  | "search"
  | "forceType"
  | "laterality"
  | "skillLevel";

export type ExercisesQueryParamKey = ExercisesFilterKey | "page";

export type ForceTypeFilterValue = OptionValue<typeof forceTypeOptions>;
export type LateralityFilterValue = OptionValue<typeof lateralityOptions>;
export type SkillLevelFilterValue = OptionValue<typeof skillLevelOptions>;

export type ExercisesCatalogQuery = {
  search?: string;
  forceType?: Exclude<ForceTypeFilterValue, typeof ANY_VALUE>;
  laterality?: Exclude<LateralityFilterValue, typeof ANY_VALUE>;
  skillLevel?: Exclude<SkillLevelFilterValue, typeof ANY_VALUE>;
};

export function getQueryValue(
  queryParams: SearchParams,
  key: ExercisesQueryParamKey,
): string | undefined {
  const value = queryParams[key];

  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

export function normalizeSearchValue(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();

  if (!normalizedValue || normalizedValue.length < 3) {
    return undefined;
  }

  return normalizedValue;
}

export function normalizeFilterValue<TOptions extends readonly Option[]>(
  value: string,
  options: TOptions,
): OptionValue<TOptions> {
  return options.some((option) => option.value === value)
    ? (value as OptionValue<TOptions>)
    : (ANY_VALUE as OptionValue<TOptions>);
}

export function getFilterLabel<TOptions extends readonly Option[]>(
  value: string,
  options: TOptions,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function normalizeQueryEnumValue<TOptions extends readonly Option[]>(
  value: string | undefined,
  options: TOptions,
): Exclude<OptionValue<TOptions>, typeof ANY_VALUE> | undefined {
  const normalizedValue = value?.trim().toUpperCase();

  if (!normalizedValue || normalizedValue === ANY_VALUE) {
    return undefined;
  }

  return options.some((option) => option.value === normalizedValue)
    ? (normalizedValue as Exclude<OptionValue<TOptions>, typeof ANY_VALUE>)
    : undefined;
}

export function parseExercisesCatalogQuery(
  queryParams: SearchParams,
): ExercisesCatalogQuery {
  return {
    search: normalizeSearchValue(getQueryValue(queryParams, "search")),
    forceType: normalizeQueryEnumValue(
      getQueryValue(queryParams, "forceType"),
      forceTypeOptions,
    ),
    laterality: normalizeQueryEnumValue(
      getQueryValue(queryParams, "laterality"),
      lateralityOptions,
    ),
    skillLevel: normalizeQueryEnumValue(
      getQueryValue(queryParams, "skillLevel"),
      skillLevelOptions,
    ),
  };
}

export function buildExercisesCatalogHref(
  query: ExercisesCatalogQuery & { page?: number },
): string {
  const params = new URLSearchParams();

  if (query.search) {
    params.set("search", query.search);
  }

  if (query.forceType) {
    params.set("forceType", query.forceType);
  }

  if (query.laterality) {
    params.set("laterality", query.laterality);
  }

  if (query.skillLevel) {
    params.set("skillLevel", query.skillLevel);
  }

  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }

  const queryString = params.toString();

  return queryString ? `/exercises?${queryString}` : "/exercises";
}
