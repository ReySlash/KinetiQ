import { serverRequest } from "@/lib/api/server-request";
import type { Exercise, ExerciseDetails } from "@/types/exercise-types";

export function fetchExercises(
  query: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }

  return serverRequest<Exercise[]>(`exercises?${params.toString()}`);
}

export function fetchExercise(slug: string) {
  return serverRequest<ExerciseDetails>(`exercises/${slug}`);
}
