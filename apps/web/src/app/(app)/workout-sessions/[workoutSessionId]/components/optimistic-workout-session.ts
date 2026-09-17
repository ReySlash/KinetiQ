import type {
  CompletedSet,
  RecordWorkoutSetInput,
  UpdateWorkoutSetInput,
  WorkoutSession,
} from "@/types/workout-session-types";

export type OptimisticWorkoutSessionAction =
  | {
      type: "record";
      exercisePerformanceId: string;
      completedSet: CompletedSet;
    }
  | {
      type: "update";
      exercisePerformanceId: string;
      completedSetId: string;
      input: UpdateWorkoutSetInput;
    }
  | {
      type: "delete";
      exercisePerformanceId: string;
      completedSetId: string;
    };

function updatePerformance(
  session: WorkoutSession,
  exercisePerformanceId: string,
  update: (completedSets: CompletedSet[]) => CompletedSet[],
): WorkoutSession {
  return {
    ...session,
    performances: session.performances.map((performance) =>
      performance.id === exercisePerformanceId
        ? { ...performance, completedSets: update([...performance.completedSets]) }
        : performance,
    ),
  };
}

function normalizeSetOrder(completedSets: CompletedSet[]): CompletedSet[] {
  return completedSets.map((completedSet, order) => ({
    ...completedSet,
    order,
  }));
}

export function optimisticWorkoutSessionReducer(
  session: WorkoutSession,
  action: OptimisticWorkoutSessionAction,
): WorkoutSession {
  switch (action.type) {
    case "record":
      return updatePerformance(
        session,
        action.exercisePerformanceId,
        (completedSets) => [...completedSets, action.completedSet],
      );
    case "update":
      return updatePerformance(
        session,
        action.exercisePerformanceId,
        (completedSets) =>
          completedSets.map((completedSet) =>
            completedSet.id === action.completedSetId
              ? {
                  ...completedSet,
                  repetitions: action.input.repetitions ?? completedSet.repetitions,
                  loadKg: action.input.load ?? completedSet.loadKg,
                  loadUnit: action.input.loadUnit ?? completedSet.loadUnit,
                  rir:
                    action.input.rir !== undefined
                      ? action.input.rir
                      : completedSet.rir,
                  isWarmup:
                    action.input.isWarmup !== undefined
                      ? action.input.isWarmup
                      : completedSet.isWarmup,
                }
              : completedSet,
          ),
      );
    case "delete":
      return updatePerformance(
        session,
        action.exercisePerformanceId,
        (completedSets) =>
          normalizeSetOrder(
            completedSets.filter(
              (completedSet) => completedSet.id !== action.completedSetId,
            ),
          ),
      );
  }
}

export function createOptimisticCompletedSet(
  completedSets: readonly CompletedSet[],
  input: RecordWorkoutSetInput,
): CompletedSet {
  const completedAt = input.completedAt ?? new Date();
  const id = globalThis.crypto?.randomUUID?.() ?? `optimistic-${Date.now()}`;

  return {
    id,
    order: completedSets.length,
    repetitions: input.repetitions,
    loadKg: input.load.trim(),
    loadUnit: input.loadUnit,
    rir: input.rir ?? null,
    isWarmup: input.isWarmup ?? false,
    completedAt: completedAt.toISOString(),
  };
}
