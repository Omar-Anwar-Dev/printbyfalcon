import { test, expect } from '@playwright/test';

test.describe('Storefront smoke', () => {
  test('homepage renders with atelier aesthetic', async ({ page }) => {
    await page.goto('/en');

    // Expect branded wordmark in nav
    await expect(page.getByText(/PrintbyFalcon/i).first()).toBeVisible();

    // Expect hero heading with display type
    await expect(page.getByRole('heading', { name: /Archival inks/i })).toBeVisible();

    // Expect Shop Now CTA
    await expect(page.getByRole('link', { name: /Shop Now/i }).first()).toBeVisible();

    // Expect announcement bar text
    await expect(page.getByText(/Free shipping/i)).toBeVisible();
  });

  test('navigates to product list and back', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: /Shop Now/i }).first().click();
    await expect(page).toHaveURL(/\/en\/products/);
    await expect(page.getByRole('heading', { name: /All Products/i })).toBeVisible();
  });

  test('search autocomplete returns suggestions', async ({ page }) => {
    await page.goto('/en');
    const search = page.getByPlaceholder(/Search products/i).first();
    await search.fill('hp');
    // Autocomplete debounces 300ms → wait for dropdown to show at least 1 HP item
    await expect(page.getByText(/HP/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Arabic locale renders RTL', async ({ page }) => {
    await page.goto('/ar');
    // Homepage headline in Arabic
    await expect(page.getByText(/حبر أصيل/i)).toBeVisible();
    // Wrapper div should have dir=rtl
    const dir = await page.locator('[dir="rtl"]').first().getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  test('health endpoint returns ok with all deps up', async ({ request }) => {
    const res = await request.get((process.env.E2E_API_URL ?? 'https://api.printbyfalcon.com') + '/api/v1/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.dependencies.db.status).toBe('up');
    expect(body.dependencies.redis.status).toBe('up');
    expect(body.dependencies.meili.status).toBe('up');
  });
});

test.describe('Auth + account guard', () => {
  test('login page renders split-screen', async ({ page }) => {
    await page.goto('/en/auth/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByText(/№ 01/)).toBeVisible();
  });

  test('unauthenticated account access redirects to login', async ({ page }) => {
    await page.goto('/en/account');
    // Wait for client-side redirect
    await page.waitForURL(/\/en\/auth\/login/, { timeout: 5000 });
  });
});
