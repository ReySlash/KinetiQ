import type {
  ExerciseOption,
  RoutineListItem,
} from "@/types/routine-types";
import { clientRequest } from "@/lib/api/client-request";

export type RoutineScope = "my" | "global";

export function listRoutines(
  search = "",
  sort: "updatedAt:asc" | "updatedAt:desc" | "name:asc" | "name:desc" = "updatedAt:desc",
  scope: RoutineScope = "my",
  options?: Pick<RequestInit, "signal">,
) {
  const params = new URLSearchParams({ limit: "100", offset: "0", scope });
  if (search.trim()) params.set("q", search.trim());
  params.set("sort", sort);
  return clientRequest<RoutineListItem[]>(`routines?${params.toString()}`, options);
}

export function listExercises(
  search = "",
  options?: Pick<RequestInit, "signal">,
) {
  const params = new URLSearchParams({ limit: "20", offset: "0" });
  if (search.trim()) params.set("search", search.trim());
  return clientRequest<ExerciseOption[]>(`exercises?${params.toString()}`, options);
}
