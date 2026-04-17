import { test, expect } from '@playwright/test';

test.describe('Search & Autocomplete', () => {
  test('Navbar autocomplete shows suggestions for "hp"', async ({ page }) => {
    await page.goto('/en');
    const search = page.getByPlaceholder(/Search products/i).first();
    await search.click();
    await search.fill('hp');
    // 300ms debounce → wait for dropdown
    await expect(page.getByText(/HP 680/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Autocomplete resolves Arabic synonym حبر → ink products', async ({ page }) => {
    await page.goto('/ar');
    const search = page.getByPlaceholder(/بحث/).first();
    await search.click();
    await search.fill('حبر');
    // Should return ink cartridges via synonym
    await expect(page.getByText(/خرطوشة/).first()).toBeVisible({ timeout: 5000 });
  });

  test('Enter key submits search → /products?search=', async ({ page }) => {
    await page.goto('/en');
    const search = page.getByPlaceholder(/Search products/i).first();
    await search.fill('canon');
    await search.press('Enter');
    await expect(page).toHaveURL(/search=canon/);
  });

  test('Typo tolerance: "Lserjet" returns LaserJet products', async ({ page }) => {
    await page.goto('/en');
    const search = page.getByPlaceholder(/Search products/i).first();
    await search.click();
    await search.fill('Lserjet');
    await expect(page.getByText(/LaserJet/i).first()).toBeVisible({ timeout: 5000 });
  });
});
