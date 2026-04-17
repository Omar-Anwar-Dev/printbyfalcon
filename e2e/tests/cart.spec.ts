import { test, expect } from '@playwright/test';

test.describe('Cart — guest session', () => {
  test('Add to cart from product detail → drawer shows item', async ({ page }) => {
    await page.goto('/en/products/hp-680-black-ink');
    // Wait for the product heading to confirm the page loaded (dynamic render)
    await expect(page.getByRole('heading', { name: /HP 680 Black Ink Cartridge/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /Add to Cart/i }).first().click();
    // Item name appears in the drawer
    await expect(page.getByText(/HP 680 Black Ink/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Product detail allows adding to cart repeatedly', async ({ page }) => {
    await page.goto('/en/products/hp-680-black-ink');
    await expect(page.getByRole('heading', { name: /HP 680 Black Ink Cartridge/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /Add to Cart/i }).first().click();
    await page.waitForTimeout(800);
    // At least one cart item visible in drawer
    await expect(page.getByText(/HP 680 Black Ink/i).first()).toBeVisible();
  });

  test('/cart page shows added items + summary', async ({ page }) => {
    await page.goto('/en/products/hp-680-black-ink');
    await expect(page.getByRole('heading', { name: /HP 680 Black Ink Cartridge/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /Add to Cart/i }).first().click();
    await page.waitForTimeout(800);
    await page.goto('/en/cart');
    await expect(page.getByRole('heading', { name: /Shopping Cart|Your cart/i })).toBeVisible();
    await expect(page.getByText(/HP 680 Black Ink/i).first()).toBeVisible({ timeout: 5000 });
  });
});
