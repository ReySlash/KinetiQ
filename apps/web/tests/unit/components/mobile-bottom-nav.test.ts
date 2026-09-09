import { describe, expect, it } from "vitest";

import { mobileNavigationItems } from "@/app/(app)/_components/mobile-bottom-nav";

describe("mobile bottom navigation", () => {
  it("prioritizes the core training journey in display order", () => {
    expect(mobileNavigationItems.map(({ href }) => href)).toEqual([
      "/dashboard",
      "/training-programs",
      "/workout-sessions",
      "/routines",
    ]);
    expect(mobileNavigationItems.map(({ label }) => label)).toEqual([
      "Dashboard",
      "Programs",
      "Workouts",
      "Routines",
    ]);
  });
});
