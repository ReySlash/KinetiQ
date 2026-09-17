import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/error";

const { request } = vi.hoisted(() => ({
  request: vi.fn(),
}));

vi.mock("@/lib/api/server-request", () => ({
  serverRequest: request,
}));

import { fetchWorkoutSession } from "@/lib/workout-sessions-server";

describe("fetchWorkoutSession", () => {
  beforeEach(() => {
    request.mockReset();
  });

  it("treats a bad session id as not found", async () => {
    request.mockRejectedValue(new ApiError("Invalid session id", 400));

    await expect(fetchWorkoutSession("asd")).resolves.toBeNull();
  });

  it("treats a missing session as not found", async () => {
    request.mockRejectedValue(new ApiError("Session not found", 404));

    await expect(fetchWorkoutSession("missing")).resolves.toBeNull();
  });

  it("preserves rate-limit results", async () => {
    request.mockRejectedValue(new ApiError("Too many requests", 429));

    await expect(fetchWorkoutSession("limited")).resolves.toEqual({
      status: "rate-limited",
    });
  });

  it("rethrows server errors", async () => {
    const error = new ApiError("Internal server error", 500);
    request.mockRejectedValue(error);

    await expect(fetchWorkoutSession("broken")).rejects.toBe(error);
  });
});
