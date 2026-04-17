# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: error-pages.spec.ts >> Error & edge pages >> sitemap.xml includes at least 5 URLs
- Location: tests\error-pages.spec.ts:22:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 5
Received:   4
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Error & edge pages', () => {
  4  |   test('404 on nonexistent route shows custom page', async ({ page }) => {
  5  |     const res = await page.goto('/en/does-not-exist-xyz');
  6  |     expect(res?.status()).toBe(404);
  7  |     await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  8  |     await expect(page.getByRole('link', { name: /home|Back to home/i }).first()).toBeVisible();
  9  |   });
  10 | 
  11 |   test('Unknown product slug shows 404', async ({ page }) => {
  12 |     const res = await page.goto('/en/products/this-product-does-not-exist');
  13 |     expect(res?.status()).toBe(404);
  14 |   });
  15 | 
  16 |   test('Unknown locale falls back', async ({ page }) => {
  17 |     const res = await page.goto('/fr');
  18 |     // Should redirect or 404, not 500
  19 |     expect([200, 302, 404]).toContain(res?.status() ?? 0);
  20 |   });
  21 | 
  22 |   test('sitemap.xml includes at least 5 URLs', async ({ request }) => {
  23 |     const res = await request.get('/sitemap.xml');
  24 |     expect(res.ok()).toBeTruthy();
  25 |     const xml = await res.text();
  26 |     const locs = xml.match(/<loc>/g) ?? [];
> 27 |     expect(locs.length).toBeGreaterThan(5);
     |                         ^ Error: expect(received).toBeGreaterThan(expected)
  28 |   });
  29 | 
  30 |   test('robots.txt disallows /admin and /checkout', async ({ request }) => {
  31 |     const res = await request.get('/robots.txt');
  32 |     const body = await res.text();
  33 |     expect(body).toMatch(/Disallow:\s*\/admin/);
  34 |     expect(body).toMatch(/Disallow:\s*\/checkout/);
  35 |   });
  36 | });
  37 | 
```