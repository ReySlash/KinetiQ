"use server";

import { revalidatePath } from "next/cache";

import { actionResult, type ActionResult } from "@/lib/actions/action-result";
import { serverRequest } from "@/lib/api/server-request";
import type { RoutineCreateInput } from "@/types/routine-types";

const jsonHeaders = { "Content-Type": "application/json" };

function refreshRoutines(slug?: string) {
  revalidatePath("/routines");
  if (slug) revalidatePath(`/routines/${slug}`);
}

export async function saveRoutineAction(
  input: RoutineCreateInput,
  slug?: string,
): Promise<ActionResult<{ message: string }>> {
  const result = await actionResult(() =>
    serverRequest<{ message: string }>(slug ? `routines/${slug}` : "routines", {
      method: slug ? "PATCH" : "POST",
      headers: jsonHeaders,
      body: JSON.stringify(input),
    }),
  );
  if (result.ok) refreshRoutines(slug);
  return result;
}

export async function deleteRoutineAction(
  slug: string,
): Promise<ActionResult<{ message: string }>> {
  const result = await actionResult(() =>
    serverRequest<{ message: string }>(`routines/${slug}`, { method: "DELETE" }),
  );
  if (result.ok) refreshRoutines(slug);
  return result;
}

export async function duplicateRoutineAction(
  slug: string,
): Promise<ActionResult<{ message: string }>> {
  const result = await actionResult(() =>
    serverRequest<{ message: string }>(`routines/${slug}/duplicate`, {
      method: "POST",
    }),
  );
  if (result.ok) refreshRoutines();
  return result;
}
