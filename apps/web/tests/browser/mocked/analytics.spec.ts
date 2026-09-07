import { expect, test, type BrowserContext } from "@playwright/test";

async function useScenario(context: BrowserContext, scenario: string) {
  await context.addCookies([
    { name: "better-auth.session_token", value: "mock-session", url: "http://127.0.0.1:3101" },
    { name: "mock_scenario", value: scenario, url: "http://127.0.0.1:3101" },
  ]);
}

test.describe("mocked analytics dashboard", () => {
  test("renders performance metrics, links, switching, and expansion", async ({ page, context }) => {
    await useScenario(context, "analytics-populated");
    await page.goto("/analytics");

    await expect(page.getByRole("heading", { name: "Analytics", level: 1 })).toBeVisible();
    await expect(page.getByText("Completed workouts", { exact: true })).toBeVisible();
    await expect(page.getByText("+33.3% vs previous period", { exact: true })).toBeVisible();
    await expect(page.getByText("Weekly performance", { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Reps" }).click();
    await expect(page.getByText("Repetitions across 2 local weeks.")).toBeVisible();

    await expect(page.getByRole("link", { name: "Barbell Back Squat" })).toHaveAttribute(
      "href",
      "/exercises/barbell-back-squat",
    );
    await expect(page.getByRole("link", { name: "Pull Up" })).toHaveCount(0);
    await page.locator('[data-slot="card"]').filter({ hasText: "Top exercises" }).getByRole("button", { name: "Show all" }).click();
    await expect(page.getByRole("link", { name: "Pull Up" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Upper strength" })).toHaveAttribute(
      "href",
      "/workout-sessions/session-4",
    );
  });

  test("is mobile-usable without horizontal page overflow", async ({ page, context }) => {
    await useScenario(context, "analytics-mobile");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/analytics");

    await expect(page.getByText("Top exercises", { exact: true })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Max" })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
      .toBe(true);
  });

  test("renders empty, partial-volume, unauthenticated, and failed states", async ({ page, context }) => {
    await useScenario(context, "analytics-empty");
    await page.goto("/analytics");
    await expect(page.getByText("No completed workouts yet", { exact: true })).toBeVisible();

    await useScenario(context, "analytics-partial");
    await page.reload();
    await expect(page.getByText("Partial", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Comparison unavailable vs previous period", { exact: true })).toBeVisible();

    await useScenario(context, "analytics-error");
    await page.reload();
    await expect(page.getByText("Analytics could not be loaded", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();

    await context.clearCookies();
    await page.reload();
    await expect(page.getByText("Sign in to view analytics", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in?callbackURL=%2Fanalytics",
    );
  });
});
