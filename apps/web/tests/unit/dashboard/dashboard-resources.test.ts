import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/error";

const mocks = vi.hoisted(() => ({
  fetchAuthSession: vi.fn(),
  fetchActiveProgram: vi.fn(),
  fetchActiveWorkout: vi.fn(),
  getTimezone: vi.fn(),
}));

vi.mock("@/lib/auth-server", () => ({
  fetchServerAuthSession: mocks.fetchAuthSession,
}));
vi.mock("@/lib/adopted-training-programs-server", () => ({
  fetchActiveAdoptedTrainingProgram: mocks.fetchActiveProgram,
}));
vi.mock("@/lib/workout-sessions-server", () => ({
  fetchActiveWorkoutSession: mocks.fetchActiveWorkout,
}));
vi.mock("@/lib/timezone-server", () => ({
  getServerTimezone: mocks.getTimezone,
}));

import { readDashboardResources } from "@/app/(app)/dashboard/dashboard-resources";

describe("readDashboardResources", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getTimezone.mockResolvedValue(null);
    mocks.fetchActiveProgram.mockResolvedValue({
      status: "authenticated",
      program: null,
    });
    mocks.fetchActiveWorkout.mockResolvedValue({
      status: "authenticated",
      session: null,
    });
  });

  it("returns an unavailable state when session loading fails with a server error", async () => {
    mocks.fetchAuthSession.mockRejectedValue(
      new ApiError("Failed to get session", 500),
    );

    await expect(readDashboardResources()).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("preserves the rate-limited state for session loading", async () => {
    mocks.fetchAuthSession.mockRejectedValue(
      new ApiError("Too many requests", 429),
    );

    await expect(readDashboardResources()).resolves.toEqual({
      status: "rate-limited",
    });
  });
});
