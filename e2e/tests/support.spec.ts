import { test, expect } from '@playwright/test';

// Runs under `customer` project — auth state pre-loaded

test.describe('Support tickets', () => {
  test('Tickets list shows seeded ticket with priority badge', async ({ page }) => {
    await page.goto('/en/support');
    await expect(page.getByText(/HIGH/)).toBeVisible();
    await expect(page.getByText(/HP 680 cartridge is not recognised/i)).toBeVisible();
  });

  test('Ticket detail shows reply thread', async ({ page }) => {
    await page.goto('/en/support');
    await page.locator('a[href*="/en/support/"]').filter({ hasText: /HP 680/i }).first().click();
    await expect(page.getByText(/I just installed/i)).toBeVisible();
    await expect(page.getByText(/Team/i).first()).toBeVisible();
  });

  test('Create new ticket form submits', async ({ page }) => {
    await page.goto('/en/support/new');
    await page.getByLabel(/Subject/i).fill('E2E test ticket ' + Date.now());
    await page.getByLabel(/Message/i).fill('This is an automated end-to-end test ticket. Please ignore.');
    await page.getByRole('button', { name: /Submit ticket/i }).click();
    await page.waitForURL(/\/en\/support\/[a-z0-9-]+/, { timeout: 10_000 });
    await expect(page.getByText(/E2E test ticket/)).toBeVisible();
  });
});
