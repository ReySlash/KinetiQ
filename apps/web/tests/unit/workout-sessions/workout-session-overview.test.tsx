import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkoutSessionOverview } from "@/app/(app)/workout-sessions/[workoutSessionId]/components/workout-session-overview";

const session = {
  id: "session-1",
  status: "IN_PROGRESS" as const,
  timezone: "Asia/Qatar",
  startedAt: "2026-08-25T08:00:00.000Z",
  provenance: {
    sourceKind: "ROUTINE" as const,
    adoptedTrainingProgramId: null,
    programWorkoutOccurrenceId: null,
    programNameSnapshot: null,
    programWeekNumber: null,
    programDayNumber: null,
    programRoutineNameSnapshot: null,
  },
  performances: [
    {
      id: "performance-1",
      exerciseNameSnapshot: "Bench Press",
      order: 0,
      targetSetCount: 3,
      targetMinReps: 6,
      targetMaxReps: 10,
      targetRir: 2,
      completedSets: [],
    },
    {
      id: "performance-2",
      exerciseNameSnapshot: "Pull Up",
      order: 1,
      targetSetCount: 3,
      targetMinReps: 5,
      targetMaxReps: 8,
      targetRir: null,
      completedSets: [
        {
          id: "set-1",
          order: 0,
          repetitions: 6,
          loadKg: "0",
          loadUnit: "KG" as const,
          rir: null,
          isWarmup: false,
          completedAt: "2026-08-25T08:10:00.000Z",
        },
      ],
    },
  ],
};

describe("WorkoutSessionOverview", () => {
  it("shows progress and routes to start or continue each exercise", () => {
    render(<WorkoutSessionOverview session={session} />);

    expect(screen.getByText("0/3")).toBeInTheDocument();
    expect(screen.getByText("1/3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start/i })).toHaveAttribute(
      "href",
      "/workout-sessions/session-1/exercises/performance-1",
    );
    expect(screen.getByRole("link", { name: /continue/i })).toHaveAttribute(
      "href",
      "/workout-sessions/session-1/exercises/performance-2",
    );
    expect(screen.getByRole("link", { name: /start bench press/i })).not.toHaveClass(
      "text-primary",
    );
    expect(screen.getByRole("link", { name: /continue pull up/i })).toHaveClass(
      "text-primary",
    );
  });
});
