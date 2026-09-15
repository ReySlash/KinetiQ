import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveRoutineAction, duplicateRoutineAction, deleteRoutineAction } from "@/app/(app)/routines/routine-server-actions";
import { ApiError } from "@/lib/api/error";

const mocks = vi.hoisted(() => ({ request: vi.fn(), revalidate: vi.fn() }));

vi.mock("@/lib/api/server-request", () => ({ serverRequest: mocks.request }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));

describe("routine Server Actions", () => {
  beforeEach(() => {
    mocks.request.mockReset();
    mocks.revalidate.mockReset();
  });

  it("saves through the authenticated server transport and revalidates affected routes", async () => {
    mocks.request.mockResolvedValue({ message: "Saved" });
    const input = { name: "Upper A", description: null, exercises: [] };

    await expect(saveRoutineAction(input, "upper-a")).resolves.toEqual({
      ok: true, data: { message: "Saved" },
    });
    expect(mocks.request).toHaveBeenCalledWith("routines/upper-a", expect.objectContaining({
      method: "PATCH", body: JSON.stringify(input),
    }));
    expect(mocks.revalidate).toHaveBeenCalledWith("/routines");
    expect(mocks.revalidate).toHaveBeenCalledWith("/routines/upper-a");
  });

  it("returns API failures without revalidating", async () => {
    mocks.request.mockRejectedValue(new ApiError("Sign in required", 401, "UNAUTHORIZED"));

    await expect(duplicateRoutineAction("global-upper")).resolves.toEqual({
      ok: false, status: 401, code: "UNAUTHORIZED", message: "Sign in required",
    });
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it("revalidates the deleted detail and list", async () => {
    mocks.request.mockResolvedValue({ message: "Deleted" });
    await deleteRoutineAction("upper-a");
    expect(mocks.revalidate).toHaveBeenCalledWith("/routines/upper-a");
    expect(mocks.revalidate).toHaveBeenCalledWith("/routines");
  });
});
