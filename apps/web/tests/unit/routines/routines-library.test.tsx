import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RoutinesLibrary } from "@/app/(app)/routines/components/routines-library";

vi.mock("@/app/(app)/routines/components/routines-filters", () => ({
  RoutinesFilters: () => null,
}));

vi.mock("@/components/more-link", () => ({
  MoreLink: () => null,
}));

const routines = [
  {
    slug: "push",
    name: "Push",
    description: null,
    visibility: "GLOBAL" as const,
    updatedAt: "2026-09-01T00:00:00.000Z",
    exerciseCount: 6,
  },
  {
    slug: "custom",
    name: "Push Day",
    description: null,
    visibility: "PRIVATE" as const,
    updatedAt: "2026-09-01T00:00:00.000Z",
    exerciseCount: 4,
  },
];

describe("RoutinesLibrary routine covers", () => {
  it("uses matched covers and the existing fallback in both layouts", () => {
    render(<RoutinesLibrary routines={routines} scope="my" />);

    const images = screen.getAllByAltText("Routine cover");
    const sources = images.map((image) =>
      decodeURIComponent(image.getAttribute("src") ?? ""),
    );
    expect(images).toHaveLength(4);
    expect(
      sources.filter((source) =>
        source.includes("/assets/Covers/push.webp?v=2"),
      ),
    ).toHaveLength(2);
    expect(
      sources.filter((source) => source.includes("/assets/empty-state-exercises.webp")),
    ).toHaveLength(2);
  });
});
