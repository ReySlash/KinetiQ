import { expect, test } from "@playwright/test";
import axe from "axe-core";

test("marketing page has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => {
    const axeRunner = (window as unknown as { axe: typeof axe }).axe;
    return axeRunner.run(document, {
      resultTypes: ["violations"],
    });
  });

  const seriousViolations = results.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical",
  );
  expect(seriousViolations).toEqual([]);
});
