import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdoptedProgramActions } from "@/app/(app)/training-programs/adopted/[adoptedTrainingProgramId]/components/adopted-program-actions";
import type { AdoptedTrainingProgram } from "@/types/adopted-training-program-types";

const api = vi.hoisted(() => ({
  update: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: api.push, refresh: api.refresh }),
}));

vi.mock("@/app/(app)/training-programs/training-program-server-actions", () => ({
  updateAdoptedProgramAction: api.update,
}));

function fixture(overrides: Partial<AdoptedTrainingProgram> = {}): AdoptedTrainingProgram {
  const occurrence = {
    id: "occurrence-id",
    weekNumber: 1,
    dayNumber: 1,
    routineNameSnapshot: "Upper A",
    sourceRoutineSlug: "upper-a",
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
  return render(<AdoptedProgramActions program={program} />);
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
    await user.click(screen.getByRole("button", { name: /go back/i }));
    await user.click(screen.getByRole("button", { name: /cancel program/i }));
    expect(screen.getByRole("heading", { name: /cancel this program/i })).toBeInTheDocument();
    expect(api.update).not.toHaveBeenCalled();
  });

  it("confirms pause before mutating", async () => {
    const user = userEvent.setup();
    api.update.mockResolvedValue({ ok: true, status: 200, data: {} });
    renderActions();

    await user.click(screen.getByRole("button", { name: /pause program/i }));
    expect(screen.getByRole("heading", { name: /pause this program/i })).toBeInTheDocument();
    expect(api.update).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /keep active/i }));
    expect(api.update).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /pause program/i }));
    await user.click(screen.getByRole("button", { name: /^pause program$/i }));
    expect(api.update).toHaveBeenCalledWith("program-id", { type: "pause" });
  });

  it.each([
    ["ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE", /routine is no longer available/i],
    ["ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT", /refreshed it with the latest progress/i],
    ["ADOPTED_TRAINING_PROGRAM_SOURCE_INTEGRITY_FAILED", /could not safely start/i],
  ])("handles stable mutation code %s", async (code, message) => {
    api.update.mockResolvedValue({ ok: false, status: 409, code, message: "unsafe backend detail" });
    const user = userEvent.setup();
    renderActions();
    await user.click(screen.getAllByRole("button", { name: /start workout/i })[0]);
    expect(await screen.findByText(message)).toBeInTheDocument();
    if (code === "ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE" || code === "ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT") {
      expect(api.refresh).toHaveBeenCalled();
    }
  });
});
