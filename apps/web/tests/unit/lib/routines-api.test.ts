import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { listRoutines } from "@/lib/routines-api";
import { server } from "../../mocks/server";

describe("routines API", () => {
  it("supports an empty result from the API", async () => {
    server.use(
      http.get("http://localhost:3000/api/routines", () => HttpResponse.json([])),
    );

    await expect(listRoutines("  ", "name:asc", "global")).resolves.toEqual([]);
  });

  it("preserves API failures for the UI to present", async () => {
    server.use(
      http.get("http://localhost:3000/api/routines", () =>
        HttpResponse.json({ message: "Service unavailable" }, { status: 503 }),
      ),
    );

    await expect(listRoutines()).rejects.toMatchObject({
      message: "Service unavailable",
      status: 503,
    });
  });
});
