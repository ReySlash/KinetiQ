import { cookies } from "next/headers";

import type {
  TrainingProgramDetail,
  TrainingProgramListItem,
  TrainingProgramScope,
} from "@/types/training-program-types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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

  const cookieHeader = (await cookies()).toString();
  const response = await fetch(
    `${apiUrl}/api/training-programs?${params.toString()}`,
    {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    },
  );

  if (response.status === 401) return { status: "unauthenticated" };
  if (!response.ok)
    throw new Error(`Failed to fetch training programs: ${response.status}`);

  return {
    status: "authenticated",
    programs: (await response.json()) as TrainingProgramListItem[],
  };
}

export async function fetchTrainingProgram(
  slug: string,
): Promise<TrainingProgramDetail | null> {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${apiUrl}/api/training-programs/${slug}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`Failed to fetch training program: ${response.status}`);
  return response.json() as Promise<TrainingProgramDetail>;
}
