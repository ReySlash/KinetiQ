import type { AdoptedTrainingProgram } from "@/types/adopted-training-program-types";

export type MobileProgramAction =
  | { kind: "continue"; workoutSessionId: string }
  | { kind: "resume" }
  | { kind: "start"; occurrenceId: string };

export function getMobileProgramAction(
  program: AdoptedTrainingProgram,
): MobileProgramAction | null {
  const activeSessionId = program.occurrences.find(
    (occurrence) => occurrence.activeSessionId !== null,
  )?.activeSessionId;

  if (activeSessionId) {
    return { kind: "continue", workoutSessionId: activeSessionId };
  }

  if (program.actions.canResume) return { kind: "resume" };

  if (program.actions.canStartNext && program.nextPendingOccurrence) {
    return {
      kind: "start",
      occurrenceId: program.nextPendingOccurrence.id,
    };
  }

  return null;
}
