import { describe, expect, it } from "vitest";

import {
  optimisticWorkoutSessionReducer,
  type OptimisticWorkoutSessionAction,
} from "@/app/(app)/workout-sessions/[workoutSessionId]/components/optimistic-workout-session";
import type { WorkoutSession } from "@/types/workout-session-types";

const session: WorkoutSession = {
  id: "session-id",
  status: "IN_PROGRESS",
  timezone: "Asia/Qatar",
  startedAt: "2026-09-03T08:00:00.000Z",
  provenance: {
    sourceKind: "ROUTINE",
    adoptedTrainingProgramId: null,
    programWorkoutOccurrenceId: null,
    programNameSnapshot: null,
    programWeekNumber: null,
    programDayNumber: null,
    programRoutineNameSnapshot: null,
  },
  performances: [
    {
      id: "performance-id",
      exerciseNameSnapshot: "Bench Press",
      order: 0,
      targetSetCount: 3,
      targetMinReps: 8,
      targetMaxReps: 10,
      targetRir: 2,
      completedSets: [
        {
          id: "set-1",
          order: 0,
          repetitions: 8,
          loadKg: "80",
          loadUnit: "KG",
          rir: 2,
          isWarmup: false,
          completedAt: "2026-09-03T08:10:00.000Z",
        },
      ],
    },
  ],
};

describe("optimisticWorkoutSessionReducer", () => {
  it("records a temporary set at the end of the selected performance", () => {
    const action: OptimisticWorkoutSessionAction = {
      type: "record",
      exercisePerformanceId: "performance-id",
      completedSet: {
        id: "optimistic-set",
        order: 1,
        repetitions: 10,
        loadKg: "85",
        loadUnit: "KG",
        rir: null,
        isWarmup: false,
        completedAt: "2026-09-03T08:11:00.000Z",
      },
    };

    const result = optimisticWorkoutSessionReducer(session, action);

    expect(result.performances[0].completedSets).toHaveLength(2);
    expect(result.performances[0].completedSets[1]).toEqual(
      action.completedSet,
    );
  });

  it("updates a set while preserving its identity and completion timestamp", () => {
    const result = optimisticWorkoutSessionReducer(session, {
      type: "update",
      exercisePerformanceId: "performance-id",
      completedSetId: "set-1",
      input: { repetitions: 9, load: "82.5", loadUnit: "KG" },
    });

    expect(result.performances[0].completedSets[0]).toMatchObject({
      id: "set-1",
      repetitions: 9,
      loadKg: "82.5",
      loadUnit: "KG",
      completedAt: "2026-09-03T08:10:00.000Z",
    });

    const clearedRir = optimisticWorkoutSessionReducer(session, {
      type: "update",
      exercisePerformanceId: "performance-id",
      completedSetId: "set-1",
      input: { rir: null },
    });
    expect(clearedRir.performances[0].completedSets[0].rir).toBeNull();
  });

  it("deletes a set and normalizes the remaining set order", () => {
    const withTwoSets = optimisticWorkoutSessionReducer(session, {
      type: "record",
      exercisePerformanceId: "performance-id",
      completedSet: {
        id: "set-2",
        order: 1,
        repetitions: 10,
        loadKg: "85",
        loadUnit: "KG",
        rir: null,
        isWarmup: false,
        completedAt: "2026-09-03T08:11:00.000Z",
      },
    });

    const result = optimisticWorkoutSessionReducer(withTwoSets, {
      type: "delete",
      exercisePerformanceId: "performance-id",
      completedSetId: "set-1",
    });

    expect(result.performances[0].completedSets).toHaveLength(1);
    expect(result.performances[0].completedSets[0]).toMatchObject({
      id: "set-2",
      order: 0,
    });
  });
});
