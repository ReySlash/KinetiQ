import { expect, test, type BrowserContext } from "@playwright/test";

async function authenticate(
  context: BrowserContext,
  scenario: string,
) {
  await context.addCookies([
    {
      name: "better-auth.session_token",
      value: "mock-session",
      url: "http://127.0.0.1:3101",
    },
    {
      name: "mock_scenario",
      value: scenario,
      url: "http://127.0.0.1:3101",
    },
  ]);
}

test.describe("mocked dashboard", () => {
  test("shows the authenticated command center with recent training", async ({
    page,
    context,
  }) => {
    await authenticate(context, "default");
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "Welcome back, Mock" })).toBeVisible();
    await expect(page.getByText("Upper A", { exact: true })).toBeVisible();
    await expect(page.getByText("This week", { exact: true })).toBeVisible();
    const metrics = page.getByRole("region", { name: "This week" });
    await expect(metrics.getByText("Workouts", { exact: true })).toBeVisible();
    await expect(metrics.getByText("Sets", { exact: true })).toBeVisible();
    await expect(metrics.getByText("Reps", { exact: true })).toBeVisible();
    await expect(metrics.getByText("Volume", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Recent workouts", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "View all" })).toHaveAttribute(
      "href",
      "/workout-sessions",
    );
    await page.getByRole("link", { name: "View analytics" }).hover();
    await expect(
      page.getByText("Open your full training analytics", { exact: true }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Upper A" }).first().hover();
    await expect(
      page.getByText("Open Upper A routine details", { exact: true }),
    ).toBeVisible();
  });

  test("continues an active workout before offering program actions", async ({
    page,
    context,
  }) => {
    await authenticate(context, "continue");
    await page.goto("/dashboard");

    await expect(page.getByText("Continue Upper A", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue workout" }).first()).toHaveAttribute(
      "href",
      /\/workout-sessions\/423e4567/,
    );
    await expect(page.getByRole("link", { name: "Start a workout" })).toHaveCount(0);
  });

  test("starts the next program occurrence and opens its created session", async ({
    page,
    context,
  }) => {
    await authenticate(context, "dashboard-start");
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Start workout" }).focus();
    await expect(
      page.getByText("Start the next workout in your active program", {
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Start workout" }).click();
    await expect(page).toHaveURL(
      /\/workout-sessions\/423e4567-e89b-12d3-a456-426614174000$/,
    );
  });

  test("opens a paused program when there is no active workout", async ({
    page,
    context,
  }) => {
    await authenticate(context, "paused");
    await page.goto("/dashboard");

    await expect(page.getByText("Your program is paused", { exact: true })).toBeVisible();
    await expect(page.getByText("Paused", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open active program" }).first()).toHaveAttribute(
      "href",
      /\/training-programs\/adopted\//,
    );
  });

  test("keeps the dashboard structure when there is no completed history", async ({
    page,
    context,
  }) => {
    await authenticate(context, "analytics-empty");
    await page.goto("/dashboard");

    await expect(page.getByText("This week", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "This week" }).getByText("Workouts", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Next workout in your program", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Recent workouts", { exact: true })).toBeVisible();
    await expect(
      page.getByText("No completed workouts this week.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Open active program" })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Start workout" })).toHaveCount(1);
  });

  test("degrades training reads independently", async ({ page, context }) => {
    await authenticate(context, "dashboard-workout-error");
    await page.goto("/dashboard");
    await expect(
      page.getByText("Training plan is unavailable", { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText("This week", { exact: true })).toBeVisible();

    await authenticate(context, "dashboard-program-error");
    await page.reload();
    await expect(
      page.getByText("Training plan is unavailable", { exact: true }).first(),
    ).toBeVisible();
  });

  test("shows one signed-out state", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByText("Sign in to see your training dashboard", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in?callbackURL=%2Fdashboard",
    );
  });
});
