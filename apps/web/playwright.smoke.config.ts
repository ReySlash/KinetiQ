import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser/smoke",
  fullyParallel: false,
  reporter: process.env.CI ? [["dot"], ["github"]] : "list",
  use: {
    baseURL: process.env.WEB_SMOKE_BASE_URL ?? "http://127.0.0.1:3001",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
});
