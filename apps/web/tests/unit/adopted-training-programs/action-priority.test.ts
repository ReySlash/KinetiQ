import { describe, expect, it } from "vitest";

import { getMobileProgramAction } from "@/app/(app)/training-programs/adopted/[adoptedTrainingProgramId]/components/adopted-program-action-priority";
import type { AdoptedTrainingProgram } from "@/types/adopted-training-program-types";

function program(
  overrides: Partial<AdoptedTrainingProgram> = {},
): AdoptedTrainingProgram {
  return {
    id: "program-id",
    programNameSnapshot: "Strength Base",
    status: "ACTIVE",
    durationWeeksSnapshot: 2,
    startedAt: "2026-09-03T08:00:00.000Z",
    completedAt: null,
    cancelledAt: null,
    totalCount: 2,
    completedCount: 0,
    skippedCount: 0,
    resolvedCount: 0,
    progressPercent: 0,
    occurrences: [
      {
        id: "occurrence-id",
        weekNumber: 1,
        dayNumber: 1,
        routineNameSnapshot: "Upper A",
        programSlotNotesSnapshot: null,
        status: "PENDING",
        sourceRoutineAvailable: true,
        sessionAttemptIds: [],
        activeSessionId: null,
        latestSessionId: null,
      },
    ],
    nextPendingOccurrence: null,
    actions: {
      canPause: false,
      canResume: false,
      canCancel: false,
      canStartNext: false,
      canSkipNext: false,
    },
    ...overrides,
  };
}

describe("adopted program mobile action priority", () => {
  it("prioritizes continuing any active occurrence over all lifecycle flags", () => {
    const value = program({
      occurrences: [
        {
          ...program().occurrences[0],
          status: "IN_PROGRESS",
          activeSessionId: "session-id",
        },
      ],
      actions: { ...program().actions, canResume: true, canStartNext: true },
    });

    expect(getMobileProgramAction(value)).toEqual({
      kind: "continue",
      workoutSessionId: "session-id",
    });
  });

  it("uses resume before start", () => {
    const value = program({
      actions: { ...program().actions, canResume: true, canStartNext: true },
    });

    expect(getMobileProgramAction(value)).toEqual({ kind: "resume" });
  });

  it("uses the server-selected next occurrence for start", () => {
    const occurrence = program().occurrences[0];
    const value = program({
      nextPendingOccurrence: occurrence,
      actions: { ...program().actions, canStartNext: true },
    });

    expect(getMobileProgramAction(value)).toEqual({
      kind: "start",
      occurrenceId: occurrence.id,
    });
  });

  it("renders no sticky action without an active session or server permission", () => {
    expect(getMobileProgramAction(program())).toBeNull();
  });
});
