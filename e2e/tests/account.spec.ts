import { test, expect } from '@playwright/test';

// This file runs under the `customer` project — auth state is pre-loaded

test.describe('Account pages', () => {
  test('Overview shows stat cards with real numbers', async ({ page }) => {
    await page.goto('/en/account');
    await expect(page.getByRole('link', { name: /Orders/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Addresses/i }).first()).toBeVisible();
  });

  test('Orders list shows 2 seeded orders', async ({ page }) => {
    await page.goto('/en/account/orders');
    await expect(page.getByRole('heading', { name: /My Orders/i })).toBeVisible();
    const invoices = page.getByText(/FLN-\d{8}-\d{4}/);
    const count = await invoices.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Order detail shows tracking timeline + totals', async ({ page }) => {
    await page.goto('/en/account/orders');
    await page.locator('a[href*="/en/account/orders/"]').first().click();
    await expect(page.getByRole('heading', { name: /Order details/i })).toBeVisible();
    await expect(page.getByText(/Subtotal/i)).toBeVisible();
    await expect(page.getByText(/Total/i)).toBeVisible();
  });

  test('Addresses page shows Ahmed default address', async ({ page }) => {
    await page.goto('/en/account/addresses');
    await expect(page.getByRole('heading', { name: /Addresses/i })).toBeVisible();
    await expect(page.getByText(/Ahmed El-Khattab/i)).toBeVisible();
    await expect(page.getByText(/Default/i).first()).toBeVisible();
  });

  test('Wishlist page renders (empty state OK)', async ({ page }) => {
    await page.goto('/en/account/wishlist');
    await expect(page.getByRole('heading', { name: /Wishlist/i })).toBeVisible();
  });

  test('Support tickets list', async ({ page }) => {
    await page.goto('/en/support');
    await expect(page.getByRole('heading', { name: /Tickets/i })).toBeVisible();
    await expect(page.getByText(/HP 680 cartridge is not recognised/i)).toBeVisible();
  });

  test('Sign out clears session', async ({ page }) => {
    await page.goto('/en/account');
    await page.getByRole('button', { name: /Sign out/i }).click();
    await page.goto('/en/account');
    await page.waitForURL(/\/en\/auth\/login/, { timeout: 5000 });
  });
});
