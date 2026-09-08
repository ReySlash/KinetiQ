import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardMetrics } from "@/app/(app)/dashboard/components/dashboard-metrics";
import { DashboardRecentWorkouts } from "@/app/(app)/dashboard/components/dashboard-recent-workouts";
import { DashboardHeader } from "@/app/(app)/dashboard/components/dashboard-header";
import { TrainingPlanCard } from "@/app/(app)/dashboard/components/training-plan-card";
import type { AnalyticsOverview } from "@/types/analytics-types";
import type { AdoptedTrainingProgram } from "@/types/adopted-training-program-types";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  startProgramWorkout: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push, refresh: navigation.refresh }),
}));

vi.mock("@/lib/adopted-training-programs-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/adopted-training-programs-api")>()),
  startProgramWorkout: navigation.startProgramWorkout,
}));

const overview = {
  totals: {
    completedWorkouts: 4,
    trainingDays: 3,
    completedWorkingSets: 18,
    warmupSets: 5,
    totalRepetitions: 146,
    volumeLoadKg: null,
    activeWeeks: 2,
    completeWeeks: 1,
    averageWorkoutsPerCompleteWeek: 3,
  },
  volumeCompleteness: {
    status: "PARTIAL" as const,
    includedSetCount: 16,
    excludedSetCount: 2,
  },
  recentWorkouts: [
    {
      workoutSessionId: "session-1",
      displayName: "Upper strength",
      startedAt: "2026-09-06T18:00:00.000Z",
      completedAt: "2026-09-06T19:00:00.000Z",
      completedWorkingSetCount: 6,
      totalRepetitions: 48,
      volumeLoadKg: null,
      volumeCompleteness: {
        status: "UNAVAILABLE" as const,
        includedSetCount: 0,
        excludedSetCount: 6,
      },
    },
    {
      workoutSessionId: "session-2",
      displayName: "Lower strength",
      startedAt: "2026-09-04T18:00:00.000Z",
      completedAt: "2026-09-04T19:00:00.000Z",
      completedWorkingSetCount: 5,
      totalRepetitions: 42,
      volumeLoadKg: "1200.00",
      volumeCompleteness: {
        status: "COMPLETE" as const,
        includedSetCount: 5,
        excludedSetCount: 0,
      },
    },
    {
      workoutSessionId: "session-3",
      displayName: "Pull day",
      startedAt: "2026-09-02T18:00:00.000Z",
      completedAt: "2026-09-02T19:00:00.000Z",
      completedWorkingSetCount: 4,
      totalRepetitions: 32,
      volumeLoadKg: "900.00",
      volumeCompleteness: {
        status: "PARTIAL" as const,
        includedSetCount: 3,
        excludedSetCount: 1,
      },
    },
    {
      workoutSessionId: "session-4",
      displayName: "Extra history",
      startedAt: "2026-08-30T18:00:00.000Z",
      completedAt: "2026-08-30T19:00:00.000Z",
      completedWorkingSetCount: 3,
      totalRepetitions: 24,
      volumeLoadKg: "500.00",
      volumeCompleteness: {
        status: "COMPLETE" as const,
        includedSetCount: 3,
        excludedSetCount: 0,
      },
    },
  ],
} as AnalyticsOverview;

const program = {
  id: "program-1",
  programNameSnapshot: "Strength Base",
  status: "ACTIVE",
  nextPendingOccurrence: null,
} as AdoptedTrainingProgram;

const activeProgram = {
  ...program,
  totalCount: 36,
  resolvedCount: 0,
  progressPercent: 0,
  actions: {
    canPause: true,
    canResume: false,
    canCancel: true,
    canStartNext: true,
    canSkipNext: true,
  },
  nextPendingOccurrence: {
    id: "occurrence-1",
    weekNumber: 1,
    dayNumber: 1,
    routineNameSnapshot: "Push",
    programSlotNotesSnapshot: null,
    status: "PENDING",
    sourceRoutineSlug: "push",
    sourceRoutineAvailable: true,
    sessionAttemptIds: [],
    activeSessionId: null,
    latestSessionId: null,
  },
} as AdoptedTrainingProgram;

describe("dashboard components", () => {
  beforeEach(() => {
    Object.values(navigation).forEach((mock) => mock.mockReset());
  });

  it("renders the safe continuation action", () => {
    render(
      <TrainingPlanCard
        action={{ kind: "continue", workoutSessionId: "session-1" }}
        activeWorkout={{
          id: "session-1",
          status: "IN_PROGRESS",
          timezone: "UTC",
          startedAt: "2026-09-06T18:00:00.000Z",
          provenance: {
            sourceKind: "FREESTYLE",
            adoptedTrainingProgramId: null,
            programWorkoutOccurrenceId: null,
            programNameSnapshot: null,
            programWeekNumber: null,
            programDayNumber: null,
            programRoutineNameSnapshot: null,
          },
          performances: [],
        }}
        activeProgram={null}
      />,
    );

    expect(screen.getByRole("link", { name: "Continue workout" })).toHaveAttribute(
      "href",
      "/workout-sessions/session-1",
    );
  });

  it("shows unavailable volume without converting it to zero", () => {
    render(<DashboardMetrics overview={overview} />);
    expect(screen.getByText("Workouts", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("Sets", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("Reps", { exact: true })).toBeInTheDocument();
    expect(screen.queryByText("Volume", { exact: true })).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "This week" }).querySelector(".grid-cols-3"),
    ).not.toBeNull();
  });

  it("starts the next occurrence and opens the returned workout session", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    navigation.startProgramWorkout.mockResolvedValue({
      workoutSessionId: "session-2",
      occurrenceId: "occurrence-1",
      sessionStatus: "IN_PROGRESS",
      occurrenceStatus: "IN_PROGRESS",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TrainingPlanCard
          action={{ kind: "program", adoptedTrainingProgramId: activeProgram.id }}
          activeWorkout={null}
          activeProgram={activeProgram}
        />
      </QueryClientProvider>,
    );

    const routineLink = screen.getByRole("link", { name: "Push" });
    expect(routineLink).toHaveAttribute(
      "href",
      "/routines/push",
    );
    expect(routineLink).toHaveClass("text-primary");
    expect(
      screen.getByText("Next workout in your program", { exact: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Strength Base · Week 1, day 1", { exact: true }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Start workout" }));
    expect(navigation.startProgramWorkout).toHaveBeenCalledWith(
      "program-1",
      "occurrence-1",
      expect.objectContaining({ timezone: expect.any(String) }),
    );
    await waitFor(() => {
      expect(navigation.push).toHaveBeenCalledWith("/workout-sessions/session-2");
    });
    expect(screen.getByRole("link", { name: "Open active program" })).toHaveAttribute(
      "href",
      "/training-programs/adopted/program-1",
    );
  });

  it("limits recent history to three workouts and preserves the full-history link", () => {
    render(<DashboardRecentWorkouts workouts={overview.recentWorkouts} timezone="UTC" />);
    expect(screen.getAllByText("Upper strength", { exact: true })).not.toHaveLength(0);
    expect(screen.getAllByText("Pull day", { exact: true })).not.toHaveLength(0);
    expect(screen.queryByText("Extra history", { exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute(
      "href",
      "/workout-sessions",
    );
  });

  it("keeps recent history visible when the selected week is empty", () => {
    render(<DashboardRecentWorkouts workouts={[]} timezone="UTC" />);
    expect(
      screen.getAllByText("No completed workouts this week", { exact: true }),
    ).not.toHaveLength(0);
    expect(screen.queryByRole("link", { name: "View all" })).not.toBeInTheDocument();
  });

  it("does not require a program to render the workout fallback", () => {
    render(<TrainingPlanCard action={{ kind: "workouts" }} activeWorkout={null} activeProgram={program} />);
    const newWorkoutLink = screen.getByRole("link", { name: "New workout" });
    expect(newWorkoutLink.closest("[data-slot='card-content']")).toHaveClass(
      "grid",
      "grid-cols-2",
    );
    expect(newWorkoutLink).toHaveClass(
      "w-full",
      "md:w-auto",
    );
    expect(screen.getByRole("link", { name: "Explore programs" })).toHaveClass(
      "w-full",
      "md:w-auto",
    );
  });

  it("personalizes the header without duplicating the training action", () => {
    render(<DashboardHeader name="John Smith" />);
    expect(screen.getByRole("heading", { name: "Welcome back, John" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not invent a name when the authenticated name is empty", () => {
    render(<DashboardHeader name="  " />);
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
  });
});
