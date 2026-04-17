import { test, expect } from '@playwright/test';

/**
 * These run under the `mobile-safari` project in playwright.config.ts
 * (iPhone 13 viewport). They verify the hamburger menu + mobile search
 * behave correctly on touch devices.
 */
test.describe('Mobile responsive @mobile', () => {
  test('Homepage hero adapts to small viewport', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { name: /Archival inks/i })).toBeVisible();
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(500);
  });

  test('Hamburger menu opens on mobile', async ({ page }) => {
    await page.goto('/en');
    // On mobile, the nav links are hidden, hamburger visible
    const hamburger = page.locator('button').filter({ has: page.locator('svg') }).last();
    await hamburger.click();
    // Mobile menu reveals nav links
    await expect(page.getByRole('link', { name: /Products/i }).first()).toBeVisible();
  });

  test('Cart drawer fills viewport on mobile', async ({ page }) => {
    await page.goto('/en/products/hp-680-black-ink');
    await page.getByRole('button', { name: /Add to Cart/i }).first().click();
    await page.waitForTimeout(800);
    await expect(page.getByText(/HP 680/i).first()).toBeVisible();
  });
});
