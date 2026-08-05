import type {
  ExerciseOption,
  RoutineCreateInput,
  RoutineDetail,
  RoutineListItem,
} from "@/types/routine-types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type RoutineScope = "my" | "global";

export class RoutineApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}/api/${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String(payload.message)
        : "Something went wrong. Please try again.";
    throw new RoutineApiError(message, response.status);
  }

  return payload as T;
}

export function listRoutines(
  search = "",
  sort: "updatedAt:asc" | "updatedAt:desc" | "name:asc" | "name:desc" = "updatedAt:desc",
  scope: RoutineScope = "my",
) {
  const params = new URLSearchParams({ limit: "100", offset: "0", scope });
  if (search.trim()) params.set("q", search.trim());
  params.set("sort", sort);
  return request<RoutineListItem[]>(`routines?${params.toString()}`);
}

export function listExercises(search = "") {
  const params = new URLSearchParams({ limit: "20", offset: "0" });
  if (search.trim()) params.set("search", search.trim());
  return request<ExerciseOption[]>(`exercises?${params.toString()}`);
}

export function createRoutine(input: RoutineCreateInput) {
  return request<{ message: string }>("routines", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchRoutine(slug: string) {
  return request<RoutineDetail>(`routines/${slug}`);
}

export function updateRoutine(slug: string, input: RoutineCreateInput) {
  return request<{ message: string }>(`routines/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteRoutine(slug: string) {
  return request<{ message: string }>(`routines/${slug}`, {
    method: "DELETE",
  });
}

export function duplicateRoutine(slug: string) {
  return request<{ message: string }>(`routines/${slug}/duplicate`, {
    method: "POST",
  });
}
