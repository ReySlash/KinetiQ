import { ApiError, type RateLimitedResult } from "@/lib/api/error";
import { serverRequest } from "@/lib/api/server-request";
import type { AdoptedTrainingProgram } from "@/types/adopted-training-program-types";

export type ActiveAdoptedTrainingProgramResult =
  | { status: "authenticated"; program: AdoptedTrainingProgram | null }
  | { status: "unauthenticated" }
  | RateLimitedResult;

export async function fetchActiveAdoptedTrainingProgram(): Promise<ActiveAdoptedTrainingProgramResult> {
  try {
    return {
      status: "authenticated",
      program: await serverRequest<AdoptedTrainingProgram | null>(
        "user-training-programs/active",
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

export async function fetchAdoptedTrainingProgram(
  adoptedTrainingProgramId: string,
): Promise<AdoptedTrainingProgram | null | RateLimitedResult> {
  try {
    return await serverRequest<AdoptedTrainingProgram>(
      `user-training-programs/${adoptedTrainingProgramId}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    if (error instanceof ApiError && error.status === 429) {
      return { status: "rate-limited" };
    }
    throw error;
  }
}
