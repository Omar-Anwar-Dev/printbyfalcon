import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Auth setup — runs once before the test suite. Logs in as the demo customer
 * AND the admin, saves each session to a JSON file, and every subsequent
 * project loads the right one via storageState.
 *
 * This avoids re-hitting /auth/login on every test, which would exhaust the
 * 5-attempt/15min rate limit within seconds.
 */

const authDir = path.join(__dirname, '.auth');
if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

const customerFile = path.join(authDir, 'customer.json');
const adminFile = path.join(authDir, 'admin.json');

setup('authenticate customer', async ({ page }) => {
  await page.goto('/en/auth/login');
  await page.getByLabel(/Email/i).fill('ahmed@example.com');
  await page.getByLabel(/Password/i).fill('Demo@Pass2025!');
  await page.getByRole('button', { name: /Sign in/i }).click();
  await page.waitForURL(/\/en\/account/, { timeout: 15_000 });
  await expect(page.getByText(/Ahmed/i).first()).toBeVisible();
  await page.context().storageState({ path: customerFile });
});

setup('authenticate admin', async ({ page }) => {
  await page.goto('/en/auth/login');
  await page.getByLabel(/Email/i).fill('admin@printbyfalcon.com');
  await page.getByLabel(/Password/i).fill('Admin@PrintFalcon2025!');
  await page.getByRole('button', { name: /Sign in/i }).click();
  await page.waitForURL(/\/en\/account/, { timeout: 15_000 });
  await page.context().storageState({ path: adminFile });
});
