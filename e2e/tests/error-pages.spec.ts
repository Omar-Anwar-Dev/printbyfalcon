import { test, expect } from '@playwright/test';

test.describe('Error & edge pages', () => {
  test('404 on nonexistent route shows custom page', async ({ page }) => {
    const res = await page.goto('/en/does-not-exist-xyz');
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/404|not found/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /home|Back to home/i }).first()).toBeVisible();
  });

  test('Unknown product slug shows 404', async ({ page }) => {
    const res = await page.goto('/en/products/this-product-does-not-exist');
    expect(res?.status()).toBe(404);
  });

  test('Unknown locale falls back', async ({ page }) => {
    const res = await page.goto('/fr');
    // Should redirect or 404, not 500
    expect([200, 302, 404]).toContain(res?.status() ?? 0);
  });

  test('sitemap.xml includes at least 5 URLs', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBeTruthy();
    const xml = await res.text();
    const locs = xml.match(/<loc>/g) ?? [];
    expect(locs.length).toBeGreaterThan(5);
  });

  test('robots.txt disallows /admin and /checkout', async ({ request }) => {
    const res = await request.get('/robots.txt');
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/admin/);
    expect(body).toMatch(/Disallow:\s*\/checkout/);
  });
});
