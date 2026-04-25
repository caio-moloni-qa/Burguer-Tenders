import { defineConfig, devices } from "@playwright/test";
import { BASE_URL, TIMEOUTS, VIEWPORT } from "./global.config";

/**
 * Run `npm run dev:all` before executing tests.
 * The Vite dev server proxies /api → http://localhost:3001.
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",

  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  /** Single worker — avoids session cookie collisions between suites */
  workers: 1,

  reporter: [
    ["list"],
    ["html", { outputFolder: "../playwright-report", open: "never" }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    viewport: VIEWPORT,
    actionTimeout: TIMEOUTS.action,
    navigationTimeout: TIMEOUTS.navigation,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
