import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMock, cookiesMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  cookiesMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));

import { publicServerRequest } from "@/lib/api/server-request";

describe("publicServerRequest", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    cookiesMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("uses force-cache without reading or forwarding cookies", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await expect(publicServerRequest<{ ok: boolean }>("exercises?q=dumbbell")).resolves.toEqual({
      ok: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/exercises?q=dumbbell",
      expect.objectContaining({ cache: "force-cache" }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty("headers");
    expect(cookiesMock).not.toHaveBeenCalled();
  });

  it("preserves explicit request options and API error parsing", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Catalog unavailable" }), { status: 503 }),
    );

    await expect(
      publicServerRequest("muscle-groups", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }),
    ).rejects.toMatchObject({
      message: "Catalog unavailable",
      status: 503,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/muscle-groups",
      expect.objectContaining({
        cache: "force-cache",
        headers: { Accept: "application/json" },
      }),
    );
  });
});
