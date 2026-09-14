import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RateLimitedState } from "@/components/rate-limited-state";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

describe("RateLimitedState", () => {
  beforeEach(() => refresh.mockClear());

  it("explains the limit and refreshes when retry is clicked", () => {
    render(<RateLimitedState />);

    expect(screen.getByText("Too many requests")).toBeInTheDocument();
    expect(screen.getByText("Please wait a moment before trying again.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refresh).toHaveBeenCalledOnce();
  });
});
