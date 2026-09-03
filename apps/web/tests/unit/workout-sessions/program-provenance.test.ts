import { describe, expect, it } from "vitest";

import { getProgramReturnHref } from "@/app/(app)/workout-sessions/components/workout-program-context";
import type { WorkoutSessionProvenance } from "@/types/workout-session-types";

function provenance(overrides: Partial<WorkoutSessionProvenance> = {}): WorkoutSessionProvenance {
  return {
    sourceKind: "FREESTYLE",
    adoptedTrainingProgramId: null,
    programWorkoutOccurrenceId: null,
    programNameSnapshot: null,
    programWeekNumber: null,
    programDayNumber: null,
    programRoutineNameSnapshot: null,
    ...overrides,
  };
}

describe("workout program provenance", () => {
  it("retains the canonical adopted-program destination", () => {
    expect(
      getProgramReturnHref(
        provenance({
          sourceKind: "PROGRAM_WORKOUT",
          adoptedTrainingProgramId: "adopted-id",
        }),
      ),
    ).toBe("/training-programs/adopted/adopted-id");
  });

  it("does not invent a program destination for freestyle or routine workouts", () => {
    expect(getProgramReturnHref(provenance())).toBeNull();
    expect(getProgramReturnHref(provenance({ sourceKind: "ROUTINE" }))).toBeNull();
  });
});
