import { defineConfig, devices } from "@playwright/test";

/**
 * Run `npm run dev:all` before executing tests.
 * The Vite dev server proxies /api → http://localhost:3001.
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",

  /* Run tests in files in parallel */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Single worker — avoids session cookie collisions between suites */
  workers: 1,

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],

  use: {
    /* Base URL for all page.goto() calls */
    baseURL: "http://localhost:5173",

    /* Retain trace on first retry */
    trace: "on-first-retry",

    /* Keep screenshots on failure */
    screenshot: "only-on-failure",

    /* Viewport matches the app's primary breakpoint */
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Global setup / teardown hooks (optional — add when needed) */
  // globalSetup: "./tests/global-setup.ts",
});
