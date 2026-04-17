import { test, expect } from '@playwright/test';

async function loginAsCustomer(page: any) {
  await page.goto('/en/auth/login');
  await page.getByLabel(/Email/i).fill('ahmed@example.com');
  await page.getByLabel(/Password/i).fill('Demo@Pass2025!');
  await page.getByRole('button', { name: /Sign in/i }).click();
  await page.waitForURL(/\/en\/account/, { timeout: 10_000 });
}

test.describe('Support tickets', () => {
  test('Tickets list shows seeded ticket with priority badge', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/en/support');
    await expect(page.getByText(/HIGH/)).toBeVisible();
    await expect(page.getByText(/HP 680 cartridge is not recognised/i)).toBeVisible();
  });

  test('Ticket detail shows reply thread', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/en/support');
    await page.locator('a[href*="/en/support/"]').filter({ hasText: /HP 680/i }).first().click();
    await expect(page.getByText(/I just installed/i)).toBeVisible();
    await expect(page.getByText(/Team/i).first()).toBeVisible();
  });

  test('Create new ticket form submits', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/en/support/new');
    await page.getByLabel(/Subject/i).fill('E2E test ticket ' + Date.now());
    await page.getByLabel(/Message/i).fill('This is an automated end-to-end test ticket. Please ignore.');
    await page.getByRole('button', { name: /Submit ticket/i }).click();
    // Redirects to /support/:id with the subject visible
    await page.waitForURL(/\/en\/support\/[a-z0-9-]+/, { timeout: 10_000 });
    await expect(page.getByText(/E2E test ticket/)).toBeVisible();
  });
});
