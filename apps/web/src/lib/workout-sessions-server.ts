import { ApiError, type RateLimitedResult } from "@/lib/api/error";
import { serverRequest } from "@/lib/api/server-request";
import { cache } from "react";
import type {
  WorkoutSession,
  WorkoutSessionFilters,
  WorkoutSessionListItem,
} from "@/types/workout-session-types";

export type WorkoutSessionsFetchResult =
  | { status: "authenticated"; sessions: WorkoutSessionListItem[] }
  | { status: "unauthenticated" }
  | RateLimitedResult;

export type ActiveWorkoutFetchResult =
  | { status: "authenticated"; session: WorkoutSession | null }
  | { status: "unauthenticated" }
  | RateLimitedResult;

export async function fetchActiveWorkoutSession(): Promise<ActiveWorkoutFetchResult> {
  try {
    return {
      status: "authenticated",
      session: await serverRequest<WorkoutSession | null>(
        "workout-sessions/active",
      ),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { status: "unauthenticated" };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { status: "rate-limited" };
    }
    throw error;
  }
}

export async function fetchWorkoutSessions(
  filters: WorkoutSessionFilters = {},
): Promise<WorkoutSessionsFetchResult> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
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
    if (error instanceof ApiError && error.status === 429) {
      return { status: "rate-limited" };
    }
    throw error;
  }
}

export const fetchWorkoutSession = cache(async function fetchWorkoutSession(
  workoutSessionId: string,
): Promise<WorkoutSession | null | RateLimitedResult> {
  try {
    return await serverRequest<WorkoutSession>(
      `workout-sessions/${workoutSessionId}`,
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 400 || error.status === 404)
    ) {
      return null;
    }
    if (error instanceof ApiError && error.status === 429) {
      return { status: "rate-limited" };
    }
    throw error;
  }
});
