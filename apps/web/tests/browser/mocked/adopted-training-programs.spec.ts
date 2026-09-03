import { expect, test, type BrowserContext } from "@playwright/test";

const programId = "123e4567-e89b-12d3-a456-426614174000";

async function useScenario(
  context: BrowserContext,
  scenario: string,
) {
  await context.addCookies([
    { name: "better-auth.session_token", value: "mock-session", url: "http://127.0.0.1:3101" },
    { name: "mock_scenario", value: scenario, url: "http://127.0.0.1:3101" },
  ]);
}

test.describe("mocked adopted training program journey", () => {
  test("provides route-level loading, empty, and error contracts", async ({ page, context }) => {
    await useScenario(context, "loading");
    const navigation = page.goto("/training-programs/active");
    await expect(page.locator('[data-slot="skeleton"]').first()).toBeVisible();
    await navigation;

    await useScenario(context, "empty");
    await page.goto("/training-programs/active");
    await expect(page.getByText("No active program", { exact: true })).toBeVisible();

    await useScenario(context, "error");
    await page.goto("/training-programs/active");
    await expect(page.getByText("Active program unavailable", { exact: true })).toBeVisible();

    await useScenario(context, "loading");
    const detailNavigation = page.goto(`/training-programs/adopted/${programId}`);
    await expect(page.locator('[data-slot="skeleton"]').first()).toBeVisible();
    await detailNavigation;

    await useScenario(context, "error");
    await page.goto(`/training-programs/adopted/${programId}`);
    await expect(page.getByText("Program unavailable", { exact: true })).toBeVisible();
  });

  test("adopts a program and opens its independent snapshot", async ({ page, context }) => {
    await useScenario(context, "adoption-success");
    await page.goto("/training-programs/strength-base");
    await page.getByRole("button", { name: "Adopt program" }).click();
    await expect(page.getByRole("heading", { name: "Adopt Strength Base?" })).toBeVisible();
    await page.getByRole("button", { name: "Adopt program" }).click();
    await expect(page).toHaveURL(`/training-programs/adopted/${programId}`);
    await expect(page.getByText("Program progress", { exact: true })).toBeVisible();
  });

  test("offers the active program after an adoption conflict", async ({ page, context }) => {
    await useScenario(context, "adoption-conflict");
    await page.goto("/training-programs/strength-base");
    await page.getByRole("button", { name: "Adopt program" }).click();
    await page.getByRole("button", { name: "Adopt program" }).click();
    await expect(page.getByRole("link", { name: "View active program" })).toBeVisible();
  });

  test("pauses and resumes only when server flags allow it", async ({ page, context }) => {
    await useScenario(context, "pause-resume");
    await page.goto(`/training-programs/adopted/${programId}`);
    await page.getByRole("button", { name: "Pause program" }).click();
    await expect(page.getByText("paused", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Resume program" }).click();
    await expect(page.getByText("active", { exact: true })).toBeVisible();
  });

  test("explains unavailable routines and still permits a server-authorized skip", async ({ page, context }) => {
    await useScenario(context, "unavailable");
    await page.goto(`/training-programs/adopted/${programId}`);
    await expect(page.getByText("A scheduled routine is unavailable", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start workout" })).toHaveCount(0);
    await page.getByRole("button", { name: "Skip workout" }).click();
    await page.getByRole("button", { name: "Skip workout" }).click();
    await expect(page.getByText("Skipped", { exact: true }).first()).toBeVisible();
  });

  test("uses Continue Workout when an occurrence owns an active session", async ({ page, context }) => {
    await useScenario(context, "continue");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/training-programs/adopted/${programId}`);
    const continueLink = page.getByRole("link", { name: "Continue workout" });
    await expect(continueLink).toBeVisible();
    await expect(continueLink).toHaveAttribute("href", /workout-sessions\/423e4567/);
    await expect(page.getByRole("button", { name: "Start workout" })).toHaveCount(0);
  });

  test("returns to the program after cancellation and permits a retry", async ({ page, context }) => {
    await useScenario(context, "cancel-retry");
    await page.goto(`/training-programs/adopted/${programId}`);
    await page.getByRole("button", { name: "Start workout" }).click();
    await expect(page).toHaveURL(/\/workout-sessions\/423e4567/);
    await expect(page.getByRole("link", { name: /Strength Base · Week 1, Day 1/ })).toBeVisible();
    await page.getByRole("button", { name: "Cancel workout" }).click();
    await expect(page).toHaveURL(`/training-programs/adopted/${programId}`);
    await expect(page.getByRole("button", { name: "Start workout" })).toBeVisible();
  });

  test("refreshes terminal progress after workout completion", async ({ page, context }) => {
    await useScenario(context, "completion");
    await page.goto(`/training-programs/adopted/${programId}`);
    await page.getByRole("button", { name: "Start workout" }).click();
    await page.getByRole("button", { name: "Finish workout" }).click();
    await expect(page).toHaveURL(`/training-programs/adopted/${programId}`);
    await expect(page.getByText("100%", { exact: true })).toBeVisible();
    await expect(page.getByText("completed", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /program|workout/i })).toHaveCount(0);
  });

  test("keeps terminal programs readable without lifecycle controls", async ({ page, context }) => {
    await useScenario(context, "terminal");
    await page.goto(`/training-programs/adopted/${programId}`);
    await expect(page.getByText("100%", { exact: true })).toBeVisible();
    await expect(page.getByText("completed", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pause program" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cancel program" })).toHaveCount(0);
  });
});
