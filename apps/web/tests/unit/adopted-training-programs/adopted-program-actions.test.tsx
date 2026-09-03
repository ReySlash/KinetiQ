import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdoptedProgramActions } from "@/app/(app)/training-programs/adopted/[adoptedTrainingProgramId]/components/adopted-program-actions";
import { ApiError } from "@/lib/api/error";
import type { AdoptedTrainingProgram } from "@/types/adopted-training-program-types";

const api = vi.hoisted(() => ({
  pause: vi.fn(),
  resume: vi.fn(),
  cancel: vi.fn(),
  skip: vi.fn(),
  start: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: api.push, refresh: api.refresh }),
}));

vi.mock("@/lib/adopted-training-programs-api", () => ({
  pauseAdoptedTrainingProgram: api.pause,
  resumeAdoptedTrainingProgram: api.resume,
  cancelAdoptedTrainingProgram: api.cancel,
  skipProgramWorkout: api.skip,
  startProgramWorkout: api.start,
}));

function fixture(overrides: Partial<AdoptedTrainingProgram> = {}): AdoptedTrainingProgram {
  const occurrence = {
    id: "occurrence-id",
    weekNumber: 1,
    dayNumber: 1,
    routineNameSnapshot: "Upper A",
    programSlotNotesSnapshot: null,
    status: "PENDING" as const,
    sourceRoutineAvailable: true,
    sessionAttemptIds: [],
    activeSessionId: null,
    latestSessionId: null,
  };
  return {
    id: "program-id",
    programNameSnapshot: "Strength Base",
    status: "ACTIVE",
    durationWeeksSnapshot: 1,
    startedAt: "2026-09-03T08:00:00.000Z",
    completedAt: null,
    cancelledAt: null,
    totalCount: 1,
    completedCount: 0,
    skippedCount: 0,
    resolvedCount: 0,
    progressPercent: 0,
    occurrences: [occurrence],
    nextPendingOccurrence: occurrence,
    actions: {
      canPause: true,
      canResume: false,
      canCancel: true,
      canStartNext: true,
      canSkipNext: true,
    },
    ...overrides,
  };
}

function renderActions(program = fixture()) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdoptedProgramActions program={program} />
    </QueryClientProvider>,
  );
}

describe("AdoptedProgramActions", () => {
  beforeEach(() => {
    Object.values(api).forEach((mock) => mock.mockReset());
  });

  it("renders lifecycle controls strictly from server action flags", () => {
    renderActions();
    expect(screen.getAllByRole("button", { name: /start workout/i })).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: /skip workout/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pause program/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel program/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /resume program/i })).not.toBeInTheDocument();
  });

  it("keeps secondary lifecycle controls available on mobile", () => {
    renderActions();

    const controls = screen.getByRole("group", { name: /mobile program controls/i });
    expect(controls).toHaveTextContent("Skip workout");
    expect(controls).toHaveTextContent("Pause program");
    expect(controls).toHaveTextContent("Cancel program");
    expect(controls).not.toHaveTextContent("Start workout");
  });

  it("keeps terminal programs free of lifecycle controls", () => {
    renderActions(
      fixture({
        status: "COMPLETED",
        nextPendingOccurrence: null,
        actions: {
          canPause: false,
          canResume: false,
          canCancel: false,
          canStartNext: false,
          canSkipNext: false,
        },
      }),
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("confirms skip and cancel before mutating", async () => {
    const user = userEvent.setup();
    renderActions();
    await user.click(screen.getByRole("button", { name: /skip workout/i }));
    expect(screen.getByRole("heading", { name: /skip this workout/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /keep workout/i }));
    await user.click(screen.getByRole("button", { name: /cancel program/i }));
    expect(screen.getByRole("heading", { name: /cancel this program/i })).toBeInTheDocument();
    expect(api.skip).not.toHaveBeenCalled();
    expect(api.cancel).not.toHaveBeenCalled();
  });

  it.each([
    ["ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE", /routine is no longer available/i],
    ["ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT", /refreshed it with the latest progress/i],
    ["ADOPTED_TRAINING_PROGRAM_SOURCE_INTEGRITY_FAILED", /could not safely start/i],
  ])("handles stable mutation code %s", async (code, message) => {
    api.start.mockRejectedValue(new ApiError("unsafe backend detail", 409, code));
    const user = userEvent.setup();
    renderActions();
    await user.click(screen.getAllByRole("button", { name: /start workout/i })[0]);
    expect(await screen.findByText(message)).toBeInTheDocument();
    if (code === "ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE" || code === "ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT") {
      expect(api.refresh).toHaveBeenCalled();
    }
  });
});
