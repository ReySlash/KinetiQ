import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser/a11y",
  fullyParallel: true,
  reporter: process.env.CI ? [["dot"], ["github"]] : "list",
  use: {
    baseURL: "http://127.0.0.1:3101",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: [
    {
      command: "node tests/browser/mocked/mock-api-server.mjs",
      url: "http://127.0.0.1:3102/api/health",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "pnpm exec next dev -H 127.0.0.1 -p 3101",
      url: "http://127.0.0.1:3101",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NEXT_DIST_DIR: ".next-playwright-a11y",
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:3102",
      },
    },
  ],
});
