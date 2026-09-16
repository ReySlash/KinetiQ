import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ActiveWorkoutController } from "@/app/(app)/workout-sessions/[workoutSessionId]/components/active-workout-controller";
import { ApiError } from "@/lib/api/error";
import type { WorkoutSession } from "@/types/workout-session-types";

const mocks = vi.hoisted(() => ({
  complete: vi.fn(),
  cancel: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  record: vi.fn(),
  workoutProps: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("@/lib/workout-sessions-api", () => ({
  addWorkoutExercise: vi.fn(),
  cancelWorkout: mocks.cancel,
  completeWorkout: mocks.complete,
  deleteWorkoutSet: vi.fn(),
  recordWorkoutSet: mocks.record,
  removeWorkoutExercise: vi.fn(),
  updateWorkoutSet: vi.fn(),
}));

vi.mock("@/app/(app)/workout-sessions/[workoutSessionId]/components/active-workout", () => ({
  ActiveWorkout: (props: unknown) => {
    mocks.workoutProps(props);
    return <div>Active workout form</div>;
  },
}));

vi.mock("@/app/(app)/workout-sessions/[workoutSessionId]/components/workout-exercise-picker", () => ({
  WorkoutExercisePicker: () => <div>Exercise picker</div>,
}));

const session: WorkoutSession = {
  id: "session-id",
  status: "IN_PROGRESS",
  sourceRoutineNameSnapshot: "Upper A",
  timezone: "Asia/Qatar",
  startedAt: "2026-09-03T08:00:00.000Z",
  provenance: {
    sourceKind: "PROGRAM_WORKOUT",
    adoptedTrainingProgramId: "program-id",
    programWorkoutOccurrenceId: "occurrence-id",
    programNameSnapshot: "Strength Base",
    programWeekNumber: 1,
    programDayNumber: 1,
    programRoutineNameSnapshot: "Upper A",
  },
  performances: [],
};

describe("ActiveWorkoutController", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
  });

  it("keeps completion validation failures in the page instead of escaping", async () => {
    mocks.complete.mockRejectedValue(
      new ApiError("A workout requires at least one recorded set before completion.", 422),
    );
    const user = userEvent.setup();
    render(<ActiveWorkoutController session={session} />);

    await user.click(screen.getByRole("button", { name: "Finish workout" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Finish workout",
      }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A workout requires at least one recorded set before completion.",
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("blocks duplicate set recording and finishing while a set request is pending", async () => {
    let resolveRecord: (value: { id: string }) => void = () => undefined;
    mocks.record.mockImplementation(() => new Promise((resolve) => { resolveRecord = resolve; }));
    render(<ActiveWorkoutController session={session} />);
    const props = mocks.workoutProps.mock.lastCall?.[0] as {
      onRecordSet: (performanceId: string, input: { repetitions: number; load: string; loadUnit: "KG" }) => Promise<void>;
    };
    const input = { repetitions: 8, load: "100", loadUnit: "KG" as const };

    let first: Promise<void> = Promise.resolve();
    await act(async () => {
      first = props.onRecordSet("performance-id", input);
      await props.onRecordSet("performance-id", input);
    });

    expect(mocks.record).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Finish workout" })).toBeDisabled();
    resolveRecord({ id: "session-id" });
    await act(async () => { await first; });
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });
});
