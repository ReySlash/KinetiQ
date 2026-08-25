import { ApiError } from "@/lib/api/error";
import { serverRequest } from "@/lib/api/server-request";
import type {
  WorkoutSession,
  WorkoutSessionFilters,
  WorkoutSessionListItem,
} from "@/types/workout-session-types";

export type WorkoutSessionsFetchResult =
  | { status: "authenticated"; sessions: WorkoutSessionListItem[] }
  | { status: "unauthenticated" };

export async function fetchWorkoutSessions(
  filters: WorkoutSessionFilters = {},
): Promise<WorkoutSessionsFetchResult> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from.toISOString());
  if (filters.to) params.set("to", filters.to.toISOString());
  params.set("limit", String(filters.limit ?? 20));
  params.set("offset", String(filters.offset ?? 0));

  try {
    return {
      status: "authenticated",
      sessions: await serverRequest<WorkoutSessionListItem[]>(
        `workout-sessions?${params.toString()}`,
      ),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { status: "unauthenticated" };
    }
    throw error;
  }
}

export async function fetchWorkoutSession(
  workoutSessionId: string,
): Promise<WorkoutSession | null> {
  try {
    return await serverRequest<WorkoutSession>(
      `workout-sessions/${workoutSessionId}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
