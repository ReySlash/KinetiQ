import { describe, expect, it } from "vitest";

import { selectDashboardPrimaryAction } from "@/app/(app)/dashboard/components/dashboard-state";
import type { AdoptedTrainingProgram } from "@/types/adopted-training-program-types";
import type { WorkoutSession } from "@/types/workout-session-types";

const workout = {
  id: "workout-1",
  status: "IN_PROGRESS",
} as WorkoutSession;

const program = {
  id: "program-1",
  status: "ACTIVE",
} as AdoptedTrainingProgram;

describe("selectDashboardPrimaryAction", () => {
  it("continues an active workout before considering the active program", () => {
    expect(
      selectDashboardPrimaryAction({
        activeWorkout: workout,
        activeWorkoutError: null,
        activeProgram: program,
        activeProgramError: null,
      }),
    ).toEqual({ kind: "continue", workoutSessionId: "workout-1" });
  });

  it.each(["ACTIVE", "PAUSED"] as const)(
    "opens an %s adopted program when no workout is active",
    (status) => {
      expect(
        selectDashboardPrimaryAction({
          activeWorkout: null,
          activeWorkoutError: null,
          activeProgram: { ...program, status },
          activeProgramError: null,
        }),
      ).toEqual({ kind: "program", adoptedTrainingProgramId: "program-1" });
    },
  );

  it("offers workout creation when neither active resource exists", () => {
    expect(
      selectDashboardPrimaryAction({
        activeWorkout: null,
        activeWorkoutError: null,
        activeProgram: null,
        activeProgramError: null,
      }),
    ).toEqual({ kind: "workouts" });
  });

  it("does not suggest starting a workout when active-workout state is unknown", () => {
    expect(
      selectDashboardPrimaryAction({
        activeWorkout: null,
        activeWorkoutError: new Error("network failure"),
        activeProgram: null,
        activeProgramError: null,
      }),
    ).toEqual({ kind: "retry" });
  });

  it("requires a retry when the active program is unavailable and no workout is active", () => {
    expect(
      selectDashboardPrimaryAction({
        activeWorkout: null,
        activeWorkoutError: null,
        activeProgram: null,
        activeProgramError: new Error("program failure"),
      }),
    ).toEqual({ kind: "retry" });
  });
});
