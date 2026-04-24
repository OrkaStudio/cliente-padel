import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    headless: true,
    viewport: { width: 390, height: 844 }, // iPhone 14
    locale: "es-AR",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
})
