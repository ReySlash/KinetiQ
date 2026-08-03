import type {
  ExerciseOption,
  RoutineCreateInput,
  RoutineDetail,
  RoutineListItem,
} from "@/types/routine-types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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
    throw new Error(message);
  }

  return payload as T;
}

export function listRoutines(
  search = "",
  sort: "updatedAt:asc" | "updatedAt:desc" | "name:asc" | "name:desc" = "updatedAt:desc",
) {
  const params = new URLSearchParams({ limit: "100", offset: "0" });
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

export function fetchRoutine(id: string) {
  return request<RoutineDetail>(`routines/${id}`);
}

export function updateRoutine(id: string, input: RoutineCreateInput) {
  return request<{ message: string }>(`routines/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
