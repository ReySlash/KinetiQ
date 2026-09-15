import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveTrainingProgramAction, adoptTrainingProgramAction, updateAdoptedProgramAction } from "@/app/(app)/training-programs/training-program-server-actions";
import { ApiError } from "@/lib/api/error";

const mocks = vi.hoisted(() => ({ request: vi.fn(), revalidate: vi.fn(), timezone: vi.fn() }));

vi.mock("@/lib/api/server-request", () => ({ serverRequest: mocks.request }));
vi.mock("@/lib/timezone-server", () => ({ getServerTimezone: mocks.timezone }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));

describe("training-program Server Actions", () => {
  beforeEach(() => {
    mocks.request.mockReset();
    mocks.revalidate.mockReset();
    mocks.timezone.mockReset();
  });

  it("creates a program and revalidates its list and detail", async () => {
    mocks.request.mockResolvedValue({ message: "Created", slug: "strength-base" });
    const input = { name: "Strength Base", durationWeeks: 2, schedule: [] };

    await expect(saveTrainingProgramAction(input)).resolves.toEqual({
      ok: true, data: { message: "Created", slug: "strength-base" },
    });
    expect(mocks.request).toHaveBeenCalledWith("training-programs", expect.objectContaining({ method: "POST" }));
    expect(mocks.revalidate).toHaveBeenCalledWith("/training-programs");
    expect(mocks.revalidate).toHaveBeenCalledWith("/training-programs/strength-base");
  });

  it("preserves adoption race codes without refreshing stale data", async () => {
    mocks.request.mockRejectedValue(new ApiError("Already active", 409, "ADOPTED_TRAINING_PROGRAM_ALREADY_NON_TERMINAL"));

    await expect(adoptTrainingProgramAction("strength-base")).resolves.toEqual({
      ok: false, status: 409, code: "ADOPTED_TRAINING_PROGRAM_ALREADY_NON_TERMINAL", message: "Already active",
    });
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it("starts a scheduled workout using the validated timezone and revalidates its program", async () => {
    mocks.timezone.mockResolvedValue("Asia/Qatar");
    mocks.request.mockResolvedValue({ workoutSessionId: "workout-id" });

    await expect(updateAdoptedProgramAction("program-id", { type: "start", occurrenceId: "occurrence-id" })).resolves.toEqual({
      ok: true, data: { workoutSessionId: "workout-id" },
    });
    expect(mocks.request).toHaveBeenCalledWith(
      "user-training-programs/program-id/workouts/occurrence-id/start",
      expect.objectContaining({ body: JSON.stringify({ timezone: "Asia/Qatar" }) }),
    );
    expect(mocks.revalidate).toHaveBeenCalledWith("/training-programs/adopted/program-id");
    expect(mocks.revalidate).toHaveBeenCalledWith("/dashboard");
  });

  it("does not call the API when the browser timezone is unavailable", async () => {
    mocks.timezone.mockResolvedValue(null);

    await expect(updateAdoptedProgramAction("program-id", { type: "start", occurrenceId: "occurrence-id" })).resolves.toMatchObject({
      ok: false, code: "TIMEZONE_UNAVAILABLE",
    });
    expect(mocks.request).not.toHaveBeenCalled();
  });
});
