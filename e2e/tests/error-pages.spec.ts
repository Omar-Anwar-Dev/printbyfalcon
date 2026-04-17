import { test, expect } from '@playwright/test';

test.describe('Error & edge pages', () => {
  test('404 on nonexistent route shows custom page', async ({ page }) => {
    const res = await page.goto('/en/does-not-exist-xyz');
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/404|not found/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /home|Back to home/i }).first()).toBeVisible();
  });

  test('Unknown product slug shows not-found page', async ({ page }) => {
    await page.goto('/en/products/this-product-does-not-exist');
    // Next.js may return 200 with the not-found.tsx body, or 404; either is fine
    await expect(page.getByText(/404|not found/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Unknown locale falls back', async ({ page }) => {
    const res = await page.goto('/fr');
    // Should redirect or 404, not 500
    expect([200, 302, 404]).toContain(res?.status() ?? 0);
  });

  test('sitemap.xml serves valid XML with at least the static routes', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBeTruthy();
    const xml = await res.text();
    expect(xml).toContain('<urlset');
    const locs = xml.match(/<loc>/g) ?? [];
    // 4 static routes guaranteed; dynamic product/category routes are best-effort
    expect(locs.length).toBeGreaterThanOrEqual(4);
  });

  test('robots.txt disallows /admin and /checkout', async ({ request }) => {
    const res = await request.get('/robots.txt');
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/admin/);
    expect(body).toMatch(/Disallow:\s*\/checkout/);
  });
});
