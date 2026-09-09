import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WorkoutSessionsLibrary } from "@/app/(app)/workout-sessions/components/workout-sessions-library";

vi.mock("@/app/(app)/workout-sessions/components/workout-session-filters", () => ({
  WorkoutSessionFilters: () => null,
}));

vi.mock("@/app/(app)/workout-sessions/components/start-workout-dialog", () => ({
  StartWorkoutDialog: () => null,
}));

vi.mock("@/components/more-link", () => ({
  MoreLink: () => null,
}));

const provenance = {
  sourceKind: "FREESTYLE" as const,
  adoptedTrainingProgramId: null,
  programWorkoutOccurrenceId: null,
  programNameSnapshot: null,
  programWeekNumber: null,
  programDayNumber: null,
  programRoutineNameSnapshot: null,
};

const sessions = [
  {
    id: "push-session",
    status: "COMPLETED" as const,
    updatedAt: "2026-09-01T00:00:00.000Z",
    sourceRoutineNameSnapshot: "Push",
    timezone: "UTC",
    startedAt: "2026-09-01T00:00:00.000Z",
    completedAt: "2026-09-01T01:00:00.000Z",
    cancelledAt: null,
    completedSetCount: 6,
    provenance: { ...provenance, sourceKind: "ROUTINE" as const },
  },
  {
    id: "freestyle-session",
    status: "COMPLETED" as const,
    updatedAt: "2026-09-02T00:00:00.000Z",
    sourceRoutineNameSnapshot: null,
    timezone: "UTC",
    startedAt: "2026-09-02T00:00:00.000Z",
    completedAt: "2026-09-02T01:00:00.000Z",
    cancelledAt: null,
    completedSetCount: 4,
    provenance,
  },
];

describe("WorkoutSessionsLibrary workout covers", () => {
  it("uses the routine cover and preserves the fallback for freestyle sessions", () => {
    render(<WorkoutSessionsLibrary sessions={sessions} routines={[]} />);

    const images = screen.getAllByAltText("Workout cover");
    const sources = images.map((image) =>
      decodeURIComponent(image.getAttribute("src") ?? ""),
    );

    expect(images).toHaveLength(4);
    expect(
      sources.filter((source) => source.includes("/temp/Covers/push.webp?v=2")),
    ).toHaveLength(2);
    expect(
      sources.filter((source) => source.includes("/empty-state-exercises.webp")),
    ).toHaveLength(2);
  });
});
