"use server";

import { revalidatePath } from "next/cache";

import { actionResult, type ActionResult } from "@/lib/actions/action-result";
import { serverRequest } from "@/lib/api/server-request";
import type { TrainingProgramCreateInput } from "@/types/training-program-types";
import type {
  AdoptedTrainingProgramMutation,
  AdoptTrainingProgramResult,
  StartProgramWorkoutResult,
} from "@/types/adopted-training-program-types";
import { getServerTimezone } from "@/lib/timezone-server";

const basePath = "user-training-programs";
const jsonHeaders = { "Content-Type": "application/json" };

function refreshPrograms(id?: string, slug?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/training-programs");
  if (id) revalidatePath(`/training-programs/adopted/${id}`);
  if (slug) revalidatePath(`/training-programs/${slug}`);
}

export async function saveTrainingProgramAction(
  input: TrainingProgramCreateInput,
  slug?: string,
): Promise<ActionResult<{ message: string; slug: string }>> {
  const result = await actionResult(() =>
    serverRequest<{ message: string; slug: string }>(
      slug ? `training-programs/${slug}` : "training-programs",
      {
        method: slug ? "PATCH" : "POST",
        headers: jsonHeaders,
        body: JSON.stringify(input),
      },
    ),
  );
  if (result.ok) refreshPrograms(undefined, result.data.slug);
  return result;
}

export async function deleteTrainingProgramAction(
  slug: string,
): Promise<ActionResult<{ message: string; slug: string }>> {
  const result = await actionResult(() =>
    serverRequest<{ message: string; slug: string }>(`training-programs/${slug}`, {
      method: "DELETE",
    }),
  );
  if (result.ok) refreshPrograms(undefined, slug);
  return result;
}

export async function adoptTrainingProgramAction(
  sourceProgramSlug: string,
): Promise<ActionResult<AdoptTrainingProgramResult>> {
  const result = await actionResult(() =>
    serverRequest<AdoptTrainingProgramResult>(basePath, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ sourceProgramSlug }),
    }),
  );
  if (result.ok) {
    refreshPrograms(result.data.id, sourceProgramSlug);
    revalidatePath("/routines");
  }
  return result;
}

export type AdoptedProgramCommand =
  | { type: "pause" | "resume" | "cancel" }
  | { type: "skip" | "start"; occurrenceId: string };

export async function updateAdoptedProgramAction(
  adoptedTrainingProgramId: string,
  command: AdoptedProgramCommand,
): Promise<ActionResult<AdoptedTrainingProgramMutation | StartProgramWorkoutResult>> {
  const activeTimezone = command.type === "start" ? await getServerTimezone() : null;
  if (command.type === "start" && !activeTimezone) {
    return {
      ok: false,
      status: 400,
      code: "TIMEZONE_UNAVAILABLE",
      message: "Your timezone is not available yet. Refresh and try again.",
    };
  }

  const result = await actionResult(async () => {
    if (command.type === "start") {
      return serverRequest<StartProgramWorkoutResult>(
        `${basePath}/${adoptedTrainingProgramId}/workouts/${command.occurrenceId}/start`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ timezone: activeTimezone }),
        },
      );
    }
    if (command.type === "skip") {
      return serverRequest<AdoptedTrainingProgramMutation>(
        `${basePath}/${adoptedTrainingProgramId}/workouts/${command.occurrenceId}/skip`,
        { method: "POST" },
      );
    }
    return serverRequest<AdoptedTrainingProgramMutation>(
      `${basePath}/${adoptedTrainingProgramId}/${command.type}`,
      { method: "POST" },
    );
  });
  if (result.ok) refreshPrograms(adoptedTrainingProgramId);
  return result;
}
