import { ApiError, type RateLimitedResult } from "@/lib/api/error";
import { publicServerRequest, serverRequest } from "@/lib/api/server-request";
import type { MuscleGroup, MuscleGroupDetails } from "@/types/muscle-types";

export function fetchMuscleGroups() {
  return publicServerRequest<MuscleGroup[]>("muscle-groups").catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 429) return { status: "rate-limited" } satisfies RateLimitedResult;
    throw error;
  });
}

export function fetchMuscleGroup(slug: string) {
  return serverRequest<MuscleGroupDetails>(`muscle-groups/${slug}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) return null;
    if (error instanceof ApiError && error.status === 429) return { status: "rate-limited" } satisfies RateLimitedResult;
    throw error;
  });
}
