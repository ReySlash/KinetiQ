import { expect, test } from "@playwright/test";

test.describe("mocked browser auth flows", () => {
  test("shows validation without making an API request", async ({ page }) => {
    let apiCalls = 0;
    await page.route("**/api/**", async (route) => {
      apiCalls += 1;
      await route.continue();
    });

    await page.goto("/sign-up");
    await page.waitForTimeout(750);
    await page.locator("#name").fill("Reynaldo");
    await page.locator("#email").fill("reynaldo@example.com");
    await page.locator("#password").fill("password123");
    await page.locator("#password-confirmation").fill("different123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match.")).toBeVisible();
    expect(apiCalls).toBe(0);
  });

  test("covers loading, success, and API error states", async ({ page }) => {
    await page.route("**/api/auth/sign-in/email", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ session: { id: "session" }, user: { id: "user" } }),
      });
    });

    await page.goto("/sign-in?callbackURL=%2Froutines");
    await page.waitForTimeout(750);
    await page.getByLabel("Email").fill("reynaldo@example.com");
    await page.locator("#password").fill("password123");
    const submit = page.getByRole("button", { name: "Sign in" });
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(page).toHaveURL(/\/routines$/);

    await page.unroute("**/api/auth/sign-in/email");
    await page.goto("/sign-in");
    await page.waitForTimeout(750);
    await page.route("**/api/auth/sign-in/email", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid credentials" }),
      }),
    );
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.locator("#password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toHaveText("Invalid credentials");
  });
});
