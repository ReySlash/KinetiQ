import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { RoutineExercisePicker } from "@/app/(app)/routines/components/routine-exercise-picker";
import { server } from "../../mocks/server";

const exercise = {
  id: "exercise-1",
  name: "Bench Press",
  slug: "bench-press",
  thumbnailUrl: null,
  muscles: [],
};

function renderPicker(selectedExerciseSlugs: string[] = []) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RoutineExercisePicker
        selectedExerciseSlugs={selectedExerciseSlugs}
        onAddExercise={() => undefined}
      />
    </QueryClientProvider>,
  );
}

describe("RoutineExercisePicker", () => {
  it("does not search until three characters have settled for 300ms", async () => {
    const searches: string[] = [];
    server.use(
      http.get("http://localhost:3000/api/exercises", ({ request }) => {
        searches.push(new URL(request.url).searchParams.get("search") ?? "");
        return HttpResponse.json([exercise]);
      }),
    );
    const user = userEvent.setup();

    renderPicker();
    await user.click(screen.getByRole("button", { name: /add exercise/i }));
    const input = screen.getByRole("textbox", { name: "Search exercises" });

    await user.type(input, "be");
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(searches).toEqual([]);

    await user.type(input, "nch");
    await waitFor(() => expect(searches).toEqual(["bench"]));
    expect(screen.getByRole("button", { name: "Bench Press" })).toBeVisible();
  });

  it("offers catalog navigation, close control, and duplicate prevention", async () => {
    server.use(
      http.get("http://localhost:3000/api/exercises", () =>
        HttpResponse.json([exercise]),
      ),
    );
    const user = userEvent.setup();

    renderPicker(["bench-press"]);
    await user.click(screen.getByRole("button", { name: /add exercise/i }));

    expect(
      screen.getByRole("link", { name: "Browse all exercises" }),
    ).toHaveAttribute("href", "/exercises");
    expect(screen.getByRole("button", { name: "Close" })).toBeVisible();

    await user.type(
      screen.getByRole("textbox", { name: "Search exercises" }),
      "bench",
    );
    const exerciseButton = await screen.findByRole("button", {
      name: /Bench Press/,
    });
    expect(exerciseButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
