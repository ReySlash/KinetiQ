import type {
  ExerciseOption,
  RoutineCreateInput,
  RoutineDetail,
  RoutineListItem,
} from "@/types/routine-types";
import { clientRequest } from "@/lib/api/client-request";
import { ApiError as RoutineApiError } from "@/lib/api/error";

export { RoutineApiError };

export type RoutineScope = "my" | "global";

export function listRoutines(
  search = "",
  sort: "updatedAt:asc" | "updatedAt:desc" | "name:asc" | "name:desc" = "updatedAt:desc",
  scope: RoutineScope = "my",
) {
  const params = new URLSearchParams({ limit: "100", offset: "0", scope });
  if (search.trim()) params.set("q", search.trim());
  params.set("sort", sort);
  return clientRequest<RoutineListItem[]>(`routines?${params.toString()}`);
}

export function listExercises(search = "") {
  const params = new URLSearchParams({ limit: "20", offset: "0" });
  if (search.trim()) params.set("search", search.trim());
  return clientRequest<ExerciseOption[]>(`exercises?${params.toString()}`);
}

export function createRoutine(input: RoutineCreateInput) {
  return clientRequest<{ message: string }>("routines", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchRoutine(slug: string) {
  return clientRequest<RoutineDetail>(`routines/${slug}`);
}

export function updateRoutine(slug: string, input: RoutineCreateInput) {
  return clientRequest<{ message: string }>(`routines/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteRoutine(slug: string) {
  return clientRequest<{ message: string }>(`routines/${slug}`, {
    method: "DELETE",
  });
}

export function duplicateRoutine(slug: string) {
  return clientRequest<{ message: string }>(`routines/${slug}/duplicate`, {
    method: "POST",
  });
}
