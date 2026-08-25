import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();

    render(<QueryClientProvider client={queryClient}><WorkoutExercisePicker onAddExercise={onAddExercise} /></QueryClientProvider>);
    await user.click(screen.getByRole("button", { name: /add exercise/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Bench Press" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Bench Press" }));

    expect(onAddExercise).toHaveBeenCalledWith("exercise-1");
  });
});
