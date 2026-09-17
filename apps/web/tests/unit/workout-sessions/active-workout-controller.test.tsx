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
  updateSet: vi.fn(),
  deleteSet: vi.fn(),
  workoutProps: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("@/lib/workout-sessions-api", () => ({
  addWorkoutExercise: vi.fn(),
  cancelWorkout: mocks.cancel,
  completeWorkout: mocks.complete,
  deleteWorkoutSet: mocks.deleteSet,
  recordWorkoutSet: mocks.record,
  removeWorkoutExercise: vi.fn(),
  updateWorkoutSet: mocks.updateSet,
}));

vi.mock("@/app/(app)/workout-sessions/[workoutSessionId]/components/active-workout", () => ({
  ActiveWorkout: (props: unknown) => {
    mocks.workoutProps(props);
    const typedProps = props as { error?: string | null };
    return (
      <>
        <div>Active workout form</div>
        {typedProps.error ? <div role="alert">{typedProps.error}</div> : null}
      </>
    );
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
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Finish workout",
      }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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

  it("updates the rendered session immediately and rolls back when recording fails", async () => {
    let rejectRecord: (reason?: unknown) => void = () => undefined;
    mocks.record.mockImplementation(
      () => new Promise((_, reject) => { rejectRecord = reject; }),
    );
    render(<ActiveWorkoutController session={session} />);
    const props = mocks.workoutProps.mock.lastCall?.[0] as {
      session: WorkoutSession;
      onRecordSet: (performanceId: string, input: { repetitions: number; load: string; loadUnit: "KG" }) => Promise<void>;
    };

    let request: Promise<void> = Promise.resolve();
    await act(async () => {
      request = props.onRecordSet("performance-id", {
        repetitions: 10,
        load: "85",
        loadUnit: "KG",
      });
      await Promise.resolve();
    });

    const optimisticProps = mocks.workoutProps.mock.lastCall?.[0] as {
      session: WorkoutSession;
    };
    expect(optimisticProps.session.performances[0].completedSets).toHaveLength(2);
    expect(optimisticProps.session.performances[0].completedSets[1]).toMatchObject({
      repetitions: 10,
      loadKg: "85",
    });

    rejectRecord(new ApiError("Unable to save the set.", 500));
    await act(async () => { await request; });

    const rolledBackProps = mocks.workoutProps.mock.lastCall?.[0] as {
      session: WorkoutSession;
    };
    expect(rolledBackProps.session.performances[0].completedSets).toHaveLength(1);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to save the set.",
    );
  });

  it("updates and deletes sets optimistically before refreshing after success", async () => {
    let resolveUpdate: (value: { id: string }) => void = () => undefined;
    mocks.updateSet.mockImplementation(
      () => new Promise((resolve) => { resolveUpdate = resolve; }),
    );
    const { rerender } = render(<ActiveWorkoutController session={session} />);
    const firstProps = mocks.workoutProps.mock.lastCall?.[0] as {
      onUpdateSet: (setId: string, input: { repetitions: number; load: string; loadUnit: "KG" }) => Promise<void>;
      onDeleteSet: (setId: string) => Promise<void>;
      session: WorkoutSession;
    };

    let update: Promise<void> = Promise.resolve();
    await act(async () => {
      update = firstProps.onUpdateSet("set-1", {
        repetitions: 9,
        load: "82.5",
        loadUnit: "KG",
      });
      await Promise.resolve();
    });
    expect((mocks.workoutProps.mock.lastCall?.[0] as { session: WorkoutSession }).session.performances[0].completedSets[0]).toMatchObject({
      repetitions: 9,
      loadKg: "82.5",
    });
    resolveUpdate({ id: "session-id" });
    await act(async () => { await update; });
    expect(mocks.refresh).toHaveBeenCalledTimes(1);

    mocks.refresh.mockReset();
    let resolveDelete: (value: { id: string }) => void = () => undefined;
    mocks.deleteSet.mockImplementation(
      () => new Promise((resolve) => { resolveDelete = resolve; }),
    );
    rerender(<ActiveWorkoutController session={session} />);
    const secondProps = mocks.workoutProps.mock.lastCall?.[0] as {
      onDeleteSet: (setId: string) => Promise<void>;
    };
    let deletion: Promise<void> = Promise.resolve();
    await act(async () => {
      deletion = secondProps.onDeleteSet("set-1");
      await Promise.resolve();
    });
    expect((mocks.workoutProps.mock.lastCall?.[0] as { session: WorkoutSession }).session.performances[0].completedSets).toHaveLength(0);
    resolveDelete({ id: "session-id" });
    await act(async () => { await deletion; });
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });
});
