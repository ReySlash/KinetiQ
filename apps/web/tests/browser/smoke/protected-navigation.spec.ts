import { expect, test } from "@playwright/test";

const hasSmokeCredentials = Boolean(
  process.env.WEB_SMOKE_EMAIL && process.env.WEB_SMOKE_PASSWORD,
);

test.skip(!hasSmokeCredentials, "Real API smoke credentials are not configured.");

test("authenticates and reaches protected navigation with the real API", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(process.env.WEB_SMOKE_EMAIL ?? "");
  await page.getByLabel("Password").fill(process.env.WEB_SMOKE_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("link", { name: "Exercises" }).first()).toBeVisible();
});
