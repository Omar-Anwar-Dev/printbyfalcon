import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('English — atelier hero + featured products render', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { name: /Archival inks/i })).toBeVisible();
    await expect(page.getByText(/Free shipping/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Shop Now/i }).first()).toBeVisible();
    // Featured products: at least 4 product cards
    const productLinks = page.locator('a[href*="/en/products/"]');
    await expect(productLinks).not.toHaveCount(0);
  });

  test('Arabic locale — RTL + hero in Arabic', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.getByText(/حبر أصيل/)).toBeVisible();
    const rtlWrap = page.locator('[dir="rtl"]').first();
    await expect(rtlWrap).toHaveAttribute('dir', 'rtl');
  });

  test('Chapter I featured section shows 8 products max', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByText(/Chapter I/)).toBeVisible();
    await expect(page.getByText(/Featured/)).toBeVisible();
  });

  test('Footer oversized wordmark + contact', async ({ page }) => {
    await page.goto('/en');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.getByText(/info@printbyfalcon.com/)).toBeVisible();
    await expect(page.getByText(/EST. 2025/)).toBeVisible();
  });
});
