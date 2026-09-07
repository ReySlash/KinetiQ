import { describe, expect, it } from "vitest";

import {
  buildAnalyticsRequest,
  dateKeyInTimezone,
  formatDateKey,
  startOfWeekInTimezone,
} from "@/lib/analytics-range";

describe("analytics range", () => {
  it.each([
    ["1w", 0],
    ["2w", 7],
    ["4w", 21],
    ["26w", 175],
    ["52w", 357],
  ] as const)("starts the %s preset on the corresponding Monday", (range, days) => {
    const now = new Date("2026-09-09T12:00:00.000Z");
    const expectedFrom = startOfWeekInTimezone(new Date(now), "UTC");
    expectedFrom.setDate(expectedFrom.getDate() - days);
    expect(buildAnalyticsRequest("UTC", { range, now })).toEqual({
      ok: true,
      request: {
        timezone: "UTC",
        from: expectedFrom.toISOString(),
        to: now.toISOString(),
      },
    });
  });

  it("formats date-only week labels without UTC day shifts", () => {
    expect(formatDateKey("2026-09-07", "America/Los_Angeles")).toBe("Sep 7, 2026");
    expect(dateKeyInTimezone(new Date("2026-01-01T01:00:00.000Z"), "UTC")).toBe("2026-01-01");
  });
});
