import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdoptedProgramSchedule } from "@/app/(app)/training-programs/adopted/[adoptedTrainingProgramId]/components/adopted-program-schedule";
import type { AdoptedTrainingProgram, ProgramWorkoutOccurrence } from "@/types/adopted-training-program-types";

function occurrence(id: string, weekNumber: number, dayNumber: number): ProgramWorkoutOccurrence {
  return {
    id,
    weekNumber,
    dayNumber,
    routineNameSnapshot: `Routine ${id}`,
    programSlotNotesSnapshot: null,
    status: "PENDING",
    sourceRoutineAvailable: true,
    sessionAttemptIds: [],
    activeSessionId: null,
    latestSessionId: null,
  };
}

function program(occurrences: ProgramWorkoutOccurrence[]): AdoptedTrainingProgram {
  return {
    id: "program-id",
    programNameSnapshot: "Strength Base",
    status: "ACTIVE",
    durationWeeksSnapshot: 2,
    startedAt: "2026-09-03T08:00:00.000Z",
    completedAt: null,
    cancelledAt: null,
    totalCount: occurrences.length,
    completedCount: 0,
    skippedCount: 0,
    resolvedCount: 0,
    progressPercent: 0,
    occurrences,
    nextPendingOccurrence: occurrences[0] ?? null,
    actions: { canPause: true, canResume: false, canCancel: true, canStartNext: true, canSkipNext: true },
  };
}

describe("AdoptedProgramSchedule", () => {
  it("presents occurrences in week and day order", () => {
    render(<AdoptedProgramSchedule program={program([
      occurrence("late", 2, 2),
      occurrence("first", 1, 1),
      occurrence("middle", 2, 1),
    ])} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("Routine first")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Routine middle")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Routine late")).toBeInTheDocument();
  });

  it("explains a pending routine that can no longer be started", () => {
    const unavailable = { ...occurrence("gone", 1, 1), sourceRoutineAvailable: false };
    render(<AdoptedProgramSchedule program={program([unavailable])} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/scheduled routine is unavailable/i);
    expect(screen.getByRole("alert")).toHaveTextContent(/skip it to continue/i);
  });

  it("uses meaningful colors for every occurrence status", () => {
    const completed = { ...occurrence("completed", 1, 1), status: "COMPLETED" as const };
    const skipped = { ...occurrence("skipped", 1, 2), status: "SKIPPED" as const };
    const pending = occurrence("pending", 1, 3);
    render(<AdoptedProgramSchedule program={program([completed, skipped, pending])} />);

    expect(screen.getAllByText("Completed")[0]).toHaveClass("text-emerald-400");
    expect(screen.getAllByText("Skipped")[0]).toHaveClass("text-amber-300");
    expect(screen.getAllByText("Pending")[0]).toHaveClass("text-slate-300");
  });
});
