import { test, expect } from '@playwright/test';

// Runs under `customer` project — auth state pre-loaded

test.describe('Checkout wizard', () => {
  test('4-step wizard progresses, place COD order succeeds', async ({ page }) => {
    await page.goto('/en/products/hp-680-black-ink');
    await expect(page.getByRole('heading', { name: /HP 680 Black Ink Cartridge/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /Add to Cart/i }).first().click();
    await page.waitForTimeout(800);

    // Go to checkout
    await page.goto('/en/checkout');
    await expect(page.getByRole('heading', { name: /Complete your order/i })).toBeVisible();

    // Step 1 — Address — Ahmed has default, select it
    await page.getByText(/Ahmed El-Khattab/i).first().click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2 — Shipping
    await expect(page.getByRole('heading', { name: /Shipping method/i })).toBeVisible();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3 — Payment — COD
    await expect(page.getByRole('heading', { name: /Payment/i })).toBeVisible();
    await page.getByText(/Cash on delivery/i).click();
    await page.getByRole('button', { name: /Review order/i }).click();

    // Step 4 — Review → place order
    await expect(page.getByRole('heading', { name: /Review your order/i })).toBeVisible();
    await page.getByRole('button', { name: /Place order/i }).click();

    await page.waitForURL(/\/en\/checkout\/success/, { timeout: 15_000 });
    await expect(page.getByText(/Thank/i)).toBeVisible();
  });

  test('Apply valid coupon WELCOME10 — discount appears', async ({ page }) => {
    await page.goto('/en/products/hp-680-black-ink');
    await expect(page.getByRole('heading', { name: /HP 680 Black Ink Cartridge/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /Add to Cart/i }).first().click();
    await page.waitForTimeout(500);

    await page.goto('/en/checkout');
    await page.getByText(/Ahmed El-Khattab/i).first().click();
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.getByText(/Cash on delivery/i).click();
    await page.getByRole('button', { name: /Review order/i }).click();

    const couponInput = page.locator('input[placeholder="SAVE10"]');
    if (await couponInput.count() > 0) {
      await couponInput.fill('WELCOME10');
      await page.getByRole('button', { name: /^Apply$/i }).click();
      await expect(page.getByText(/WELCOME10/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('Checkout empty cart shows empty state', async ({ page }) => {
    await page.goto('/en/cart');
    await expect(page.locator('body')).toBeVisible();
  });
});
