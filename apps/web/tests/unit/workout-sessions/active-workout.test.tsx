import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActiveWorkout } from "@/app/(app)/workout-sessions/[workoutSessionId]/components/active-workout";

const session = {
  id: "123e4567-e89b-12d3-a456-426614174000",
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
      id: "223e4567-e89b-12d3-a456-426614174000",
      exerciseNameSnapshot: "Bench Press",
      order: 0,
      targetSetCount: 3,
      targetMinReps: 8,
      targetMaxReps: 10,
      targetRir: 2,
      completedSets: [],
    },
  ],
};

const sessionWithMultipleExercises = {
  ...session,
  performances: [
    ...session.performances,
    {
      id: "323e4567-e89b-12d3-a456-426614174000",
      exerciseNameSnapshot: "Incline Dumbbell Press",
      order: 1,
      targetSetCount: 3,
      targetMinReps: 8,
      targetMaxReps: 12,
      targetRir: 2,
      completedSets: [
        {
          id: "423e4567-e89b-12d3-a456-426614174000",
          order: 0,
          repetitions: 10,
          loadKg: "30",
          loadUnit: "KG" as const,
          rir: 2,
          isWarmup: false,
          completedAt: "2026-08-25T08:10:00.000Z",
        },
      ],
    },
  ],
};

describe("ActiveWorkout", () => {
  it("shows the current exercise prescription and an obvious set-entry action", () => {
    render(<ActiveWorkout session={session} onRecordSet={vi.fn()} />);

    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText(/3 sets/i)).toBeInTheDocument();
    expect(screen.getByText(/8–10 reps/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /record set/i })).toBeInTheDocument();
  });

  it("rejects incomplete set entry before submitting", async () => {
    const user = userEvent.setup();
    const onRecordSet = vi.fn();
    render(<ActiveWorkout session={session} onRecordSet={onRecordSet} />);

    await user.click(screen.getByRole("button", { name: /record set/i }));

    expect(screen.getByText(/repetitions.*required/i)).toBeInTheDocument();
    expect(onRecordSet).not.toHaveBeenCalled();
  });

  it("disables submission while a set request is interrupted or pending and exposes the error", () => {
    render(
      <ActiveWorkout
        session={session}
        onRecordSet={vi.fn()}
        isSubmitting
        error="Unable to save the set. Please try again."
      />,
    );

    expect(screen.getByText("Unable to save the set. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /record set/i })).toBeDisabled();
  });

  it("switches between exercises and exposes completed sets with correction actions", async () => {
    const user = userEvent.setup();
    const onDeleteSet = vi.fn();
    const onUpdateSet = vi.fn();
    render(
      <ActiveWorkout
        session={sessionWithMultipleExercises}
        onRecordSet={vi.fn()}
        onDeleteSet={onDeleteSet}
        onUpdateSet={onUpdateSet}
      />,
    );

    await user.click(screen.getByRole("button", { name: /incline dumbbell press/i }));
    expect(screen.getAllByText("Incline Dumbbell Press").length).toBeGreaterThan(0);
    expect(screen.getByText(/30 kg × 10 reps/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /edit set/i }));
    const repetitionsInput = screen.getByLabelText("Repetitions");
    await user.clear(repetitionsInput);
    await user.type(repetitionsInput, "9");
    await user.click(screen.getByRole("button", { name: /save set/i }));
    expect(onUpdateSet).toHaveBeenCalledWith("423e4567-e89b-12d3-a456-426614174000", { repetitions: 9 });
    await user.click(screen.getByRole("button", { name: /delete set/i }));
    expect(onDeleteSet).toHaveBeenCalledWith("423e4567-e89b-12d3-a456-426614174000");
  });
});
