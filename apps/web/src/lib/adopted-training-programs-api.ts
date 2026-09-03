import { clientRequest } from "@/lib/api/client-request";
import type {
  AdoptedTrainingProgram,
  AdoptedTrainingProgramMutation,
  AdoptTrainingProgramResult,
  StartProgramWorkoutInput,
  StartProgramWorkoutResult,
} from "@/types/adopted-training-program-types";

const basePath = "user-training-programs";

export function getActiveAdoptedTrainingProgram() {
  return clientRequest<AdoptedTrainingProgram | null>(`${basePath}/active`);
}

export function getAdoptedTrainingProgram(adoptedTrainingProgramId: string) {
  return clientRequest<AdoptedTrainingProgram>(
    `${basePath}/${adoptedTrainingProgramId}`,
  );
}

export function adoptTrainingProgram(sourceProgramSlug: string) {
  return clientRequest<AdoptTrainingProgramResult>(basePath, {
    method: "POST",
    body: JSON.stringify({ sourceProgramSlug }),
  });
}

function lifecycleMutation(
  adoptedTrainingProgramId: string,
  action: "pause" | "resume" | "cancel",
) {
  return clientRequest<AdoptedTrainingProgramMutation>(
    `${basePath}/${adoptedTrainingProgramId}/${action}`,
    { method: "POST" },
  );
}

export function pauseAdoptedTrainingProgram(adoptedTrainingProgramId: string) {
  return lifecycleMutation(adoptedTrainingProgramId, "pause");
}

export function resumeAdoptedTrainingProgram(adoptedTrainingProgramId: string) {
  return lifecycleMutation(adoptedTrainingProgramId, "resume");
}

export function cancelAdoptedTrainingProgram(adoptedTrainingProgramId: string) {
  return lifecycleMutation(adoptedTrainingProgramId, "cancel");
}

export function skipProgramWorkout(
  adoptedTrainingProgramId: string,
  occurrenceId: string,
) {
  return clientRequest<AdoptedTrainingProgramMutation>(
    `${basePath}/${adoptedTrainingProgramId}/workouts/${occurrenceId}/skip`,
    { method: "POST" },
  );
}

export function startProgramWorkout(
  adoptedTrainingProgramId: string,
  occurrenceId: string,
  input: StartProgramWorkoutInput,
) {
  return clientRequest<StartProgramWorkoutResult>(
    `${basePath}/${adoptedTrainingProgramId}/workouts/${occurrenceId}/start`,
    {
      method: "POST",
      body: JSON.stringify({
        ...input,
        startedAt: input.startedAt?.toISOString(),
      }),
    },
  );
}
