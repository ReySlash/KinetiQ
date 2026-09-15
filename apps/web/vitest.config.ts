import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(root, "src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/lib/auth-api.ts",
        "src/app/(app)/training-programs/training-program-server-actions.ts",
        "src/lib/api/client-request.ts",
        "src/lib/api/error.ts",
        "src/lib/url.ts",
        "src/app/(auth)/components/auth-form.tsx",
        "src/app/(app)/training-programs/adopted/[adoptedTrainingProgramId]/components/adopted-program-action-priority.ts",
        "src/app/(app)/workout-sessions/components/workout-program-context.tsx",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});
