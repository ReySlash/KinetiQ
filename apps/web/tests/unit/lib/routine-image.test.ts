import { describe, expect, it } from "vitest";

import {
  getRoutineCoverSrc,
  ROUTINE_IMAGE_FALLBACK,
} from "@/lib/routine-image";

describe("routine image helpers", () => {
  it("matches normalized exact routine names", () => {
    expect(getRoutineCoverSrc("Full Body A")).toBe(
      "/assets/Covers/full-body-a.webp?v=2",
    );
    expect(getRoutineCoverSrc("PUSH")).toBe(
      "/assets/Covers/push.webp?v=2",
    );
    expect(getRoutineCoverSrc("Upper Body")).toBe(
      "/assets/Covers/upper-body.webp?v=2",
    );
  });

  it("matches routine copies with optional numeric suffixes", () => {
    expect(getRoutineCoverSrc("Full Body A (Copy)")).toBe(
      "/assets/Covers/full-body-a.webp?v=2",
    );
    expect(getRoutineCoverSrc("Full Body A (Copy 1)")).toBe(
      "/assets/Covers/full-body-a.webp?v=2",
    );
    expect(getRoutineCoverSrc("Full Body A (copy 23)")).toBe(
      "/assets/Covers/full-body-a.webp?v=2",
    );
  });

  it("does not use keyword or unsupported-name matches", () => {
    expect(getRoutineCoverSrc("Push Day")).toBeNull();
  });

  it("exposes the existing fallback image", () => {
    expect(ROUTINE_IMAGE_FALLBACK).toBe("/assets/empty-state-exercises.webp");
  });
});
