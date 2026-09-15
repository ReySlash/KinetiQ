import { describe, expect, it } from "vitest";

import { actionResult } from "@/lib/actions/action-result";
import { ApiError } from "@/lib/api/error";

describe("actionResult", () => {
  it("returns serializable success data", async () => {
    await expect(actionResult(async () => ({ id: "created" }))).resolves.toEqual({
      ok: true,
      data: { id: "created" },
    });
  });

  it("preserves expected API error details", async () => {
    await expect(
      actionResult(async () => {
        throw new ApiError("Too many requests", 429, "RATE_LIMITED");
      }),
    ).resolves.toEqual({
      ok: false,
      status: 429,
      code: "RATE_LIMITED",
      message: "Too many requests",
    });
  });
});
