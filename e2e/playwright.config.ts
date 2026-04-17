import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,         // auth flows touch shared state — run serial
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://printbyfalcon.com',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /responsive\.spec\.ts/,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      testMatch: /responsive\.spec\.ts/,
    },
  ],
});
