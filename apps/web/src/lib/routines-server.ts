import { cookies } from "next/headers";

import type { RoutineDetail, RoutineListItem } from "@/types/routine-types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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

  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${apiUrl}/api/routines?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store",
  });

  if (response.status === 401) {
    return { status: "unauthenticated" };
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch routines: ${response.status}`);
  }

  return {
    status: "authenticated",
    routines: (await response.json()) as RoutineListItem[],
  };
}

export async function fetchRoutine(slug: string): Promise<RoutineDetail | null> {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${apiUrl}/api/routines/${slug}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch routine: ${response.status}`);

  return response.json() as Promise<RoutineDetail>;
}
