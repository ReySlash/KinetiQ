import { ApiError } from "@/lib/api/error";
import { serverRequest } from "@/lib/api/server-request";
import type { RoutineDetail, RoutineListItem } from "@/types/routine-types";

export type RoutinesFetchResult =
  | { status: "authenticated"; routines: RoutineListItem[] }
  | { status: "unauthenticated" };

export async function fetchRoutines(
  query: { q?: string; sort?: string; scope: "my" | "global" },
): Promise<RoutinesFetchResult> {
  const params = new URLSearchParams({
    limit: "100",
    offset: "0",
    scope: query.scope,
  });
  if (query.q) params.set("q", query.q);
  if (query.sort) params.set("sort", query.sort);

  try {
    return {
      status: "authenticated",
      routines: await serverRequest<RoutineListItem[]>(
        `routines?${params.toString()}`,
      ),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { status: "unauthenticated" };
    }
    throw error;
  }
}

export async function fetchRoutine(slug: string): Promise<RoutineDetail | null> {
  try {
    return await serverRequest<RoutineDetail>(`routines/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
