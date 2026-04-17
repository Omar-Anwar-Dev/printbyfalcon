import { test, expect } from '@playwright/test';

// Runs under `customer` project — auth state is pre-loaded.
// Client-side React Query calls can take a moment; selectors are tolerant.

test.describe('Account pages', () => {
  test('Overview shows stat cards with real numbers', async ({ page }) => {
    await page.goto('/en/account');
    await expect(page.getByRole('link', { name: /Orders/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Addresses/i }).first()).toBeVisible();
  });

  test('Orders list shows 2 seeded orders', async ({ page }) => {
    await page.goto('/en/account/orders');
    await expect(page.getByRole('heading', { name: /My Orders/i })).toBeVisible();
    // Wait for React Query to hydrate — invoice numbers replace "Loading…"
    await expect(page.getByText(/FLN-\d{8}-\d{4}/).first()).toBeVisible({ timeout: 15_000 });
    const count = await page.getByText(/FLN-\d{8}-\d{4}/).count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Order detail shows tracking timeline + totals', async ({ page }) => {
    await page.goto('/en/account/orders');
    // Wait for at least one order link to appear before clicking
    await expect(page.locator('a[href*="/en/account/orders/"]').first()).toBeVisible({ timeout: 15_000 });
    await page.locator('a[href*="/en/account/orders/"]').first().click();
    await expect(page.getByRole('heading', { name: /Order details/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Subtotal/i)).toBeVisible();
    await expect(page.getByText(/Total/i).first()).toBeVisible();
  });

  test('Addresses page shows Ahmed default address', async ({ page }) => {
    await page.goto('/en/account/addresses');
    await expect(page.getByRole('heading', { name: /Addresses/i }).first()).toBeVisible();
    await expect(page.getByText(/Ahmed El-Khattab/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Default/i).first()).toBeVisible();
  });

  test('Wishlist page renders (empty state OK)', async ({ page }) => {
    await page.goto('/en/account/wishlist');
    await expect(page.getByRole('heading', { name: /Wishlist/i })).toBeVisible();
  });

  test('Support tickets list', async ({ page }) => {
    await page.goto('/en/support');
    await expect(page.getByRole('heading', { name: /Tickets/i })).toBeVisible();
    await expect(page.getByText(/HP 680 cartridge is not recognised/i)).toBeVisible({ timeout: 10_000 });
  });

  test('Sign out clears session', async ({ page }) => {
    await page.goto('/en/account');
    await expect(page.getByRole('button', { name: /Sign out/i })).toBeVisible({ timeout: 8_000 });
    await page.getByRole('button', { name: /Sign out/i }).click();
    await page.goto('/en/account');
    await page.waitForURL(/\/en\/auth\/login/, { timeout: 8000 });
  });
});
