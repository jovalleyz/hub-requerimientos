import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL:    "http://localhost:5173",
    trace:      "on-first-retry",
    screenshot: "only-on-failure",
    video:      "retain-on-failure",
    locale:     "es-DO",
    timezoneId: "America/Santo_Domingo",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox",  use: { ...devices["Desktop Firefox"] } },
  ],
  webServer: {
    command:             "pnpm exec vite",
    url:                 "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout:             120_000,
  },
})