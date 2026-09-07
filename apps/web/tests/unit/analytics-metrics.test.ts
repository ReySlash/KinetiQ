import { describe, expect, it } from "vitest";

import {
  formatLoad,
  metricDelta,
  orderAnalyticsExercises,
  volumeDelta,
} from "@/lib/analytics-metrics";
import type { ExerciseFrequencySummary } from "@/types/analytics-types";

describe("analytics metrics", () => {
  it.each([
    [12, 10, "+20%"],
    [8, 10, "-20%"],
    [0, 0, "No change"],
    [4, 0, "New"],
  ])("formats %s compared with %s", (current, previous, expected) => {
    expect(metricDelta(current, previous)).toBe(expected);
  });

  it("suppresses volume comparisons unless both periods are complete", () => {
    expect(volumeDelta("1200.00", "1000.00", "COMPLETE", "COMPLETE")).toBe(
      "+20%",
    );
    expect(volumeDelta("1200.00", "1000.00", "PARTIAL", "COMPLETE")).toBeNull();
    expect(volumeDelta(null, null, "UNAVAILABLE", "UNAVAILABLE")).toBeNull();
  });

  it("describes zero load as no external load", () => {
    expect(formatLoad("0.00")).toBe("No external load");
    expect(formatLoad("95.00")).toBe("95 kg");
    expect(formatLoad(null)).toBe("Not available");
  });

  it("orders exercises by working sets, then name", () => {
    const exercise = (
      name: string,
      sets: number,
      id: string,
    ): ExerciseFrequencySummary => ({
      exerciseId: id,
      exerciseSlug: name.toLowerCase(),
      exerciseNameSnapshot: name,
      completedWorkoutCount: 1,
      completedWorkingSetCount: sets,
      totalRepetitions: 10,
      maximumLoadKg: "50.00",
      lastWorkingSet: {
        repetitions: 10,
        loadKg: "50.00",
        completedAt: "2026-09-01T12:00:00.000Z",
      },
      volumeLoadKg: "500.00",
      volumeCompleteness: {
        status: "COMPLETE",
        includedSetCount: 1,
        excludedSetCount: 0,
      },
    });
    expect(
      orderAnalyticsExercises([
        exercise("Zeta", 2, "z"),
        exercise("Beta", 4, "b"),
        exercise("Alpha", 4, "a"),
      ]).map(({ exerciseNameSnapshot }) => exerciseNameSnapshot),
    ).toEqual(["Alpha", "Beta", "Zeta"]);
  });
});
