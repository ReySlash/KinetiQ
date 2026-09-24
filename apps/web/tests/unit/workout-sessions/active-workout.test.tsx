import { render, screen, within } from "@testing-library/react";
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

    expect(screen.queryByText("Bench Press")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Bench Press thumbnail" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/3 sets · 8–10 reps/i)).toBeInTheDocument();
    expect(screen.getByText(/8–10 reps/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /record set/i })).toBeInTheDocument();
  });

  it("shows the prescribed rest timer before the first set is recorded", () => {
    render(
      <ActiveWorkout
        session={{
          ...session,
          performances: [
            { ...session.performances[0], targetRestSeconds: 120 },
          ],
        }}
        exercisePerformanceId={session.performances[0].id}
        onRecordSet={vi.fn()}
      />,
    );

    expect(screen.getByText("Rest timer")).toBeInTheDocument();
    expect(screen.getByText("2:00")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play rest timer" }),
    ).toBeEnabled();
  });

  it("rejects incomplete set entry before submitting", async () => {
    const user = userEvent.setup();
    const onRecordSet = vi.fn();
    render(<ActiveWorkout session={session} onRecordSet={onRecordSet} />);

    await user.click(screen.getByRole("button", { name: /record set/i }));

    expect(screen.getByText(/repetitions.*required/i)).toBeInTheDocument();
    expect(onRecordSet).not.toHaveBeenCalled();
  });

  it("clears the set inputs after recording succeeds", async () => {
    const user = userEvent.setup();
    const onRecordSet = vi.fn().mockResolvedValue(true);
    render(<ActiveWorkout session={session} onRecordSet={onRecordSet} />);

    const repetitions = screen.getByLabelText("Repetitions");
    const load = screen.getByLabelText("Load (kg)");
    await user.type(repetitions, "8");
    await user.type(load, "100");
    await user.click(screen.getByRole("button", { name: /record set/i }));

    expect(repetitions).toHaveValue("");
    expect(load).toHaveValue("");
  });

  it("prefills and records the optional RIR on a focused exercise page", async () => {
    const user = userEvent.setup();
    const onRecordSet = vi.fn().mockResolvedValue(true);
    render(
      <ActiveWorkout
        session={session}
        exercisePerformanceId={session.performances[0].id}
        onRecordSet={onRecordSet}
      />,
    );

    expect(screen.getByLabelText("RIR (optional)")).toHaveValue("2");
    await user.type(screen.getByLabelText("Repetitions"), "8");
    await user.type(screen.getByLabelText("Load (kg)"), "100");
    await user.click(screen.getByRole("button", { name: /record set/i }));

    expect(onRecordSet).toHaveBeenCalledWith(session.performances[0].id, {
      repetitions: 8,
      load: "100",
      loadUnit: "KG",
      rir: 2,
    });
    expect(screen.queryByRole("button", { name: /incline/i })).not.toBeInTheDocument();
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
    expect(screen.getByText("1 / 3 sets")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Completed set records" }),
    ).toHaveClass("h-44", "min-h-44", "overflow-y-auto");
    await user.click(screen.getByRole("button", { name: /edit set/i }));
    const editDialog = screen.getByRole("dialog");
    expect(editDialog).toHaveTextContent("Edit set");
    const repetitionsInput = within(editDialog).getByLabelText("Repetitions");
    await user.clear(repetitionsInput);
    await user.type(repetitionsInput, "9");
    await user.click(
      within(editDialog).getByRole("button", { name: "Save changes" }),
    );
    expect(onUpdateSet).toHaveBeenCalledWith(
      "423e4567-e89b-12d3-a456-426614174000",
      { repetitions: 9, load: "30", loadUnit: "KG" },
    );
    await user.click(screen.getByRole("button", { name: /delete set/i }));
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(onDeleteSet).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Delete set",
      }),
    );
    expect(onDeleteSet).toHaveBeenCalledWith("423e4567-e89b-12d3-a456-426614174000");
  });

  it("clears set inputs when switching exercises", async () => {
    const user = userEvent.setup();
    render(
      <ActiveWorkout
        session={sessionWithMultipleExercises}
        onRecordSet={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Repetitions"), "8");
    await user.type(screen.getByLabelText("Load (kg)"), "100");
    await user.click(
      screen.getByRole("button", { name: /incline dumbbell press/i }),
    );

    expect(screen.getByLabelText("Repetitions")).toHaveValue("");
    expect(screen.getByLabelText("Load (kg)")).toHaveValue("");
  });

  it("updates a completed-set load together with its canonical unit", async () => {
    const user = userEvent.setup();
    const onUpdateSet = vi.fn();
    render(
      <ActiveWorkout
        session={sessionWithMultipleExercises}
        onRecordSet={vi.fn()}
        onUpdateSet={onUpdateSet}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /incline dumbbell press/i }),
    );
    await user.click(screen.getByRole("button", { name: /edit set/i }));
    const editDialog = screen.getByRole("dialog");
    const loadInput = within(editDialog).getByLabelText("Load (kg)");
    await user.clear(loadInput);
    await user.type(loadInput, "32.5");
    await user.click(
      within(editDialog).getByRole("button", { name: "Save changes" }),
    );

    expect(onUpdateSet).toHaveBeenCalledWith(
      "423e4567-e89b-12d3-a456-426614174000",
      { repetitions: 10, load: "32.5", loadUnit: "KG" },
    );
  });
});
