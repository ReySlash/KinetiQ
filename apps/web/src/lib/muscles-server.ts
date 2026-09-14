import { ApiError, type RateLimitedResult } from "@/lib/api/error";
import { serverRequest } from "@/lib/api/server-request";
import type { Muscle } from "@/types/muscle-types";

export function fetchMuscle(slug: string) {
  return serverRequest<Muscle>(`muscles/${slug}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) return null;
    if (error instanceof ApiError && error.status === 429) return { status: "rate-limited" } satisfies RateLimitedResult;
    throw error;
  });
}
