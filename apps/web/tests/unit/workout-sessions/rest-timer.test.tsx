import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RestTimer } from "@/app/(app)/workout-sessions/[workoutSessionId]/components/rest-timer";

describe("RestTimer", () => {
  it("renders separate play, pause, and reset icon controls", async () => {
    const user = userEvent.setup();
    render(<RestTimer seconds={60} />);

    const play = screen.getByRole("button", { name: "Play rest timer" });
    const pause = screen.getByRole("button", { name: "Pause rest timer" });
    const reset = screen.getByRole("button", { name: "Reset rest timer" });

    expect(play).toBeDisabled();
    expect(pause).toBeEnabled();
    expect(reset).toBeEnabled();

    await user.click(pause);
    expect(play).toBeEnabled();
    expect(pause).toBeDisabled();

    await user.click(reset);
    expect(play).toBeEnabled();
    expect(pause).toBeDisabled();

    await user.click(play);
    expect(play).toBeDisabled();
    expect(pause).toBeEnabled();
  });

  it("restores a running timer from local storage", async () => {
    const user = userEvent.setup();
    const storageKey = "test:rest-timer";
    window.localStorage.clear();

    const firstRender = render(
      <RestTimer seconds={60} autoStart={false} storageKey={storageKey} />,
    );
    await user.click(screen.getByRole("button", { name: "Play rest timer" }));
    firstRender.unmount();

    render(<RestTimer seconds={60} storageKey={storageKey} />);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Pause rest timer" }),
      ).toBeEnabled(),
    );
    window.localStorage.clear();
  });
});
