import { describe, expect, it, vi } from "vitest";
import { parseApiResponse } from "@/lib/api/error";
import { clientRequest } from "@/lib/api/client-request";

describe("API boundary", () => {
  it("surfaces structured API validation messages", async () => {
    const response = new Response(JSON.stringify({ message: ["Email is invalid", "Password is required"] }), { status: 400 });

    await expect(parseApiResponse(response)).rejects.toMatchObject({
      name: "ApiError",
      message: "Email is invalid, Password is required",
      status: 400,
    });
  });

  it("includes credentials and JSON headers in client requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await expect(clientRequest<{ ok: boolean }>("health")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/health",
      expect.objectContaining({
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }),
    );
    fetchMock.mockRestore();
  });

  it("uses a safe fallback for non-JSON errors", async () => {
    await expect(parseApiResponse(new Response("bad", { status: 500 }))).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "Something went wrong. Please try again.",
        status: 500,
      }),
    );
  });

  it.each([
    [{ message: "Program changed.", code: "ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT" }],
    [{ error: { message: "Program changed.", code: "ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT" } }],
  ])("preserves stable API error codes from supported payloads", async (payload) => {
    await expect(
      parseApiResponse(new Response(JSON.stringify(payload), { status: 409 })),
    ).rejects.toMatchObject({
      name: "ApiError",
      message: "Program changed.",
      status: 409,
      code: "ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT",
    });
  });

  it("uses a null code when an API error does not expose one", async () => {
    await expect(
      parseApiResponse(
        new Response(JSON.stringify({ message: "Unavailable" }), { status: 503 }),
      ),
    ).rejects.toMatchObject({ code: null });
  });
});
