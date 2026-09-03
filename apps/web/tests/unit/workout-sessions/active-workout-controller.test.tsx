import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
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
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("@/lib/workout-sessions-api", () => ({
  addWorkoutExercise: vi.fn(),
  cancelWorkout: mocks.cancel,
  completeWorkout: mocks.complete,
  deleteWorkoutSet: vi.fn(),
  recordWorkoutSet: vi.fn(),
  removeWorkoutExercise: vi.fn(),
  updateWorkoutSet: vi.fn(),
}));

vi.mock("@/app/(app)/workout-sessions/[workoutSessionId]/components/active-workout", () => ({
  ActiveWorkout: () => <div>Active workout form</div>,
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
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <ActiveWorkoutController session={session} />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Finish workout" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A workout requires at least one recorded set before completion.",
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
