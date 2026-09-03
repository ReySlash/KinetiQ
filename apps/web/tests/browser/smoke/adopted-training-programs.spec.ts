import { expect, test, type Page } from "@playwright/test";

const email = process.env.WEB_SMOKE_EMAIL ?? "";
const password = process.env.WEB_SMOKE_PASSWORD ?? "";
const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const hasSmokeCredentials = Boolean(email && password);

test.skip(!hasSmokeCredentials, "Real API smoke credentials are not configured.");

async function authenticate(page: Page) {
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("KinetiQ Smoke Test");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Repeat password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  const signedUp = await page
    .getByRole("heading", { name: "Check your inbox" })
    .waitFor({ timeout: 3_000 })
    .then(() => true)
    .catch(() => false);

  if (!signedUp) {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    return;
  }

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("adopts, performs, completes, and advances a program with the real API", async ({
  page,
  context,
}) => {
  await authenticate(page);

  const slug = `smoke-program-${Date.now()}`;
  const createResponse = await context.request.post(
    `${apiOrigin}/api/training-programs`,
    {
      data: {
        name: "Smoke program journey",
        slug,
        description: "A disposable program for the real API browser smoke test.",
        durationWeeks: 1,
        schedule: [
          { routineSlug: "push", weekNumber: 1, dayNumber: 1 },
          { routineSlug: "push", weekNumber: 1, dayNumber: 2 },
        ],
      },
    },
  );
  expect(createResponse.ok()).toBeTruthy();

  await page.goto(`/training-programs/${slug}`);
  await page.getByRole("button", { name: "Adopt program" }).click();
  await expect(
    page.getByRole("heading", { name: "Adopt Smoke program journey?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Adopt program" }).click();
  await expect(page).toHaveURL(/\/training-programs\/adopted\/[\w-]+$/);

  await page.getByRole("button", { name: "Start workout" }).click();
  await expect(page).toHaveURL(/\/workout-sessions\/[\w-]+$/);
  await expect(
    page.getByRole("link", { name: /Smoke program journey · Week 1, Day 1/ }),
  ).toBeVisible();

  await page.getByLabel("Repetitions").fill("8");
  await page.getByLabel("Load (kg)").fill("40");
  await page.getByRole("button", { name: "Record set" }).click();
  await expect(page.getByText(/40 kg × 8 reps/)).toBeVisible();
  await page.getByRole("button", { name: "Finish workout" }).click();

  await expect(page).toHaveURL(/\/training-programs\/adopted\/[\w-]+$/);
  await expect(page.getByText("50%", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Skip workout" }).click();
  await expect(
    page.getByRole("heading", { name: "Skip this workout?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip workout" }).click();

  await expect(page.getByText("100%", { exact: true })).toBeVisible();
  await expect(page.getByText("completed", { exact: true })).toBeVisible();
});
