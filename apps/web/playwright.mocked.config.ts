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
  webServer: [
    {
      command: "node tests/browser/mocked/mock-api-server.mjs",
      url: "http://127.0.0.1:3102/api/health",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "pnpm exec next dev -p 3101",
      url: "http://localhost:3101",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:3102",
      },
    },
  ],
});
