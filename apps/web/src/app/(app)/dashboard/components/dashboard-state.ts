import type { AdoptedTrainingProgram } from "@/types/adopted-training-program-types";
import type { WorkoutSession } from "@/types/workout-session-types";

export type DashboardTrainingState = {
  activeWorkout: WorkoutSession | null;
  activeWorkoutError: Error | null;
  activeProgram: AdoptedTrainingProgram | null;
  activeProgramError: Error | null;
};

export type DashboardPrimaryAction =
  | { kind: "continue"; workoutSessionId: string }
  | { kind: "program"; adoptedTrainingProgramId: string }
  | { kind: "workouts" }
  | { kind: "retry" };

export function getDashboardFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

export function selectDashboardPrimaryAction({
  activeWorkout,
  activeWorkoutError,
  activeProgram,
  activeProgramError,
}: DashboardTrainingState): DashboardPrimaryAction {
  if (activeWorkoutError !== null) return { kind: "retry" };
  if (activeWorkout) {
    return { kind: "continue", workoutSessionId: activeWorkout.id };
  }
  if (activeProgramError !== null) return { kind: "retry" };
  if (!activeProgram) return { kind: "workouts" };
  return {
    kind: "program",
    adoptedTrainingProgramId: activeProgram.id,
  };
}
