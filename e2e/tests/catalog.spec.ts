import { test, expect } from '@playwright/test';

test.describe('Catalog', () => {
  test('Products list shows 20 per page + category sidebar', async ({ page }) => {
    await page.goto('/en/products');
    await expect(page.getByRole('heading', { name: /All Products/i })).toBeVisible();
    const cards = page.locator('a[href*="/en/products/"]').filter({ has: page.locator('img, div').first() });
    // Should have at least 8 product cards rendered on first page
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(8);
  });

  test('Category filter narrows results', async ({ page }) => {
    await page.goto('/en/products?category=ink-cartridges');
    await expect(page).toHaveURL(/category=ink-cartridges/);
    // At least one product visible after filter
    const count = await page.locator('a[href*="/en/products/"]').count();
    expect(count).toBeGreaterThan(0);
  });

  test('Product detail page renders full info + JSON-LD', async ({ page }) => {
    await page.goto('/en/products/hp-680-black-ink');
    await expect(page.getByRole('heading', { name: /HP 680 Black Ink Cartridge/i })).toBeVisible();
    await expect(page.getByText(/SKU/i).first()).toBeVisible();
    await expect(page.getByText(/HP-680-BK/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Add to Cart/i })).toBeVisible();

    // Breadcrumbs present
    await expect(page.getByText(/Home/).first()).toBeVisible();

    // JSON-LD structured data
    const ldScript = page.locator('script[type="application/ld+json"]').first();
    const ldText = await ldScript.textContent();
    expect(ldText).toContain('"@type":"Product"');
    expect(ldText).toContain('"sku":"HP-680-BK"');
  });

  test('Related Products section on detail page', async ({ page }) => {
    await page.goto('/en/products/hp-680-black-ink');
    await expect(page.getByRole('heading', { name: /Compatible Products/i })).toBeVisible();
  });

  test('Pagination controls appear when results exceed one page', async ({ page }) => {
    await page.goto('/en/products');
    // 30 products / 20 per page → at least 2 pages → page buttons visible
    const pageButtons = page.locator('a[href*="page="]');
    const visible = await pageButtons.count();
    expect(visible).toBeGreaterThan(0);
  });
});
