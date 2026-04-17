import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

const customerAuth = path.join(__dirname, '.auth/customer.json');
const adminAuth = path.join(__dirname, '.auth/admin.json');

export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
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
    // 1. Setup — logs in ONCE as customer + admin, persists auth state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts$/,
    },

    // 2. Public / guest tests — no auth state
    {
      name: 'guest',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/(homepage|catalog|search|cart|error-pages|api-integration|auth)\.spec\.ts/,
    },

    // 3. Customer-authenticated tests
    {
      name: 'customer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: customerAuth,
      },
      dependencies: ['setup'],
      testMatch: /tests\/(account|support|checkout)\.spec\.ts/,
    },

    // 4. Admin-authenticated tests
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: adminAuth,
      },
      dependencies: ['setup'],
      testMatch: /tests\/admin\.spec\.ts/,
    },

    // 5. Mobile responsive tests — guest
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      testMatch: /tests\/responsive\.spec\.ts/,
    },
  ],
});
