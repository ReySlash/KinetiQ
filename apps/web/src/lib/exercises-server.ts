import { ApiError, type RateLimitedResult } from "@/lib/api/error";
import { serverRequest } from "@/lib/api/server-request";
import type { Exercise, ExerciseDetails } from "@/types/exercise-types";

export function fetchExercises(
  query: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }

  return serverRequest<Exercise[]>(`exercises?${params.toString()}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 429) return { status: "rate-limited" } satisfies RateLimitedResult;
    throw error;
  });
}

export function fetchExercise(slug: string) {
  return serverRequest<ExerciseDetails>(`exercises/${slug}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) return null;
    if (error instanceof ApiError && error.status === 429) return { status: "rate-limited" } satisfies RateLimitedResult;
    throw error;
  });
}
