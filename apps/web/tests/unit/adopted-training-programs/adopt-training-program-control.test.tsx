import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdoptTrainingProgramControl } from "@/app/(app)/training-programs/components/adopt-training-program-control";

const { adopt, push, refresh } = vi.hoisted(() => ({
  adopt: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/training-programs/strength-base",
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/app/(app)/training-programs/training-program-server-actions", () => ({
  adoptTrainingProgramAction: adopt,
}));

function renderControl(scheduleCount = 4) {
  return render(
    <AdoptTrainingProgramControl
      slug="strength-base"
      name="Strength Base"
      durationWeeks={2}
      scheduledWorkoutCount={scheduleCount}
    />,
  );
}

describe("AdoptTrainingProgramControl", () => {
  beforeEach(() => {
    adopt.mockReset();
    push.mockReset();
    refresh.mockReset();
  });

  it("explains and disables adoption for an empty schedule", () => {
    renderControl(0);
    expect(
      screen.getByRole("button", { name: /adopt program/i }),
    ).toBeDisabled();
    expect(
      screen.getByText(/needs at least one scheduled workout/i),
    ).toBeInTheDocument();
  });

  it("confirms snapshot behavior and the one-active-program rule", async () => {
    const user = userEvent.setup();
    renderControl();
    await user.click(screen.getByRole("button", { name: /adopt program/i }));

    expect(
      screen.getByRole("heading", { name: /adopt strength base/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 weeks/i)).toBeInTheDocument();
    expect(screen.getByText(/4 scheduled workouts/i)).toBeInTheDocument();
    expect(screen.getByText(/independent snapshot/i)).toBeInTheDocument();
    expect(
      screen.getByText(/one active or paused program/i),
    ).toBeInTheDocument();
  });

  it("navigates to the adopted program after success", async () => {
    adopt.mockResolvedValue({ ok: true, data: { id: "adopted-id", status: "ACTIVE" } });
    const user = userEvent.setup();
    renderControl();
    await user.click(screen.getByRole("button", { name: /adopt program/i }));
    await user.click(screen.getByRole("button", { name: /^adopt program$/i }));

    expect(adopt).toHaveBeenCalledWith("strength-base");
    expect(push).toHaveBeenCalledWith("/training-programs/adopted/adopted-id");
  });

  it("offers the canonical active-program route after an adoption race", async () => {
    adopt.mockResolvedValue({ ok: false, status: 409, code: "ADOPTED_TRAINING_PROGRAM_ALREADY_NON_TERMINAL", message: "Already active" });
    const user = userEvent.setup();
    renderControl();
    await user.click(screen.getByRole("button", { name: /adopt program/i }));
    await user.click(screen.getByRole("button", { name: /^adopt program$/i }));

    expect(
      await screen.findByRole("link", { name: /view active program/i }),
    ).toHaveAttribute("href", "/training-programs/active");
  });

  it("refreshes and safely explains a newly unavailable source", async () => {
    adopt.mockResolvedValue({ ok: false, status: 422, code: "ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE", message: "internal source details" });
    const user = userEvent.setup();
    renderControl();
    await user.click(screen.getByRole("button", { name: /adopt program/i }));
    await user.click(screen.getByRole("button", { name: /^adopt program$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /scheduled routine is no longer available/i,
    );
    expect(refresh).toHaveBeenCalled();
  });
});
