import { describe, expect, it } from "vitest";

import {
  getRoutineCoverSrc,
  ROUTINE_IMAGE_FALLBACK,
} from "@/lib/routine-image";

describe("routine image helpers", () => {
  it("matches normalized exact routine names", () => {
    expect(getRoutineCoverSrc("Full Body A")).toBe(
      "/temp/Covers/full-body-a.webp?v=2",
    );
    expect(getRoutineCoverSrc("PUSH")).toBe(
      "/temp/Covers/push.webp?v=2",
    );
    expect(getRoutineCoverSrc("Upper Body")).toBe(
      "/temp/Covers/upper-body.webp?v=2",
    );
  });

  it("does not use keyword or unsupported-name matches", () => {
    expect(getRoutineCoverSrc("Push Day")).toBeNull();
  });

  it("exposes the existing fallback image", () => {
    expect(ROUTINE_IMAGE_FALLBACK).toBe("/empty-state-exercises.webp");
  });
});
