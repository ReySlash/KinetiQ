import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser/mocked",
  fullyParallel: true,
  reporter: process.env.CI ? [["dot"], ["github"]] : "list",
  use: {
    baseURL: "http://localhost:3101",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "pnpm exec next dev -p 3101",
    url: "http://localhost:3101",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
