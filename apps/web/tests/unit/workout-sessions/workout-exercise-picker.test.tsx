import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { WorkoutExercisePicker } from "@/app/(app)/workout-sessions/[workoutSessionId]/components/workout-exercise-picker";
import { server } from "../../mocks/server";

describe("WorkoutExercisePicker", () => {
  it("loads exercises with IDs and returns the selected ID", async () => {
    server.use(
      http.get("http://localhost:3000/api/exercises", () =>
        HttpResponse.json([{ id: "exercise-1", name: "Bench Press", slug: "bench-press", thumbnailUrl: null, muscles: [] }]),
      ),
    );
    const onAddExercise = vi.fn();
    const user = userEvent.setup();

    render(<WorkoutExercisePicker onAddExercise={onAddExercise} />);
    await user.click(screen.getByRole("button", { name: /add exercise/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Bench Press" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Bench Press" }));

    expect(onAddExercise).toHaveBeenCalledWith("exercise-1");
  });

  it("does not load exercises before the dialog opens", async () => {
    const requests = vi.fn();
    server.use(
      http.get("http://localhost:3000/api/exercises", () => {
        requests();
        return HttpResponse.json([]);
      }),
    );

    render(<WorkoutExercisePicker onAddExercise={() => undefined} />);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(requests).not.toHaveBeenCalled();
  });
});
