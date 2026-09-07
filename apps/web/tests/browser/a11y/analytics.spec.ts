import { expect, test } from "@playwright/test";
import axe from "axe-core";

for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`analytics has no serious or critical accessibility violations on ${viewport.name}`, async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: "better-auth.session_token", value: "mock-session", url: "http://127.0.0.1:3101" },
      { name: "mock_scenario", value: `analytics-a11y-${viewport.name}`, url: "http://127.0.0.1:3101" },
    ]);
    await page.setViewportSize(viewport);
    await page.goto("/analytics");
    await expect(page.getByText("Weekly performance", { exact: true })).toBeVisible();
    await page.addScriptTag({ content: axe.source });
    const results = await page.evaluate(async () => {
      const axeRunner = (window as unknown as { axe: typeof axe }).axe;
      return axeRunner.run(document, { resultTypes: ["violations"] });
    });
    expect(
      results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      ),
    ).toEqual([]);
  });
}
