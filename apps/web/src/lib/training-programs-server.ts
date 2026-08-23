import { ApiError } from "@/lib/api/error";
import { serverRequest } from "@/lib/api/server-request";
import type {
  TrainingProgramDetail,
  TrainingProgramListItem,
  TrainingProgramScope,
} from "@/types/training-program-types";

export type TrainingProgramsFetchResult =
  | { status: "authenticated"; programs: TrainingProgramListItem[] }
  | { status: "unauthenticated" };

export async function fetchTrainingPrograms(query: {
  q?: string;
  sort?: string;
  scope: TrainingProgramScope;
}): Promise<TrainingProgramsFetchResult> {
  const params = new URLSearchParams({
    limit: "20",
    offset: "0",
    scope: query.scope,
  });
  if (query.q) params.set("q", query.q);
  if (query.sort) params.set("sort", query.sort);

  try {
    return {
      status: "authenticated",
      programs: await serverRequest<TrainingProgramListItem[]>(
        `training-programs?${params.toString()}`,
      ),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { status: "unauthenticated" };
    }
    throw error;
  }
}

export async function fetchTrainingProgram(
  slug: string,
): Promise<TrainingProgramDetail | null> {
  try {
    return await serverRequest<TrainingProgramDetail>(
      `training-programs/${slug}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
