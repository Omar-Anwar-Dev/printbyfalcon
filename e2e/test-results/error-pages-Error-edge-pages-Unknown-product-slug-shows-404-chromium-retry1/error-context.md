# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: error-pages.spec.ts >> Error & edge pages >> Unknown product slug shows 404
- Location: tests\error-pages.spec.ts:11:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 200
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]: ·Free shipping within Cairo for orders above EGP 1,500·
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "✦ PrintbyFalcon Atelier · Cairo est. 2025" [ref=e6] [cursor=pointer]:
          - /url: /en
          - generic [ref=e7]: ✦
          - generic [ref=e8]:
            - generic [ref=e9]: PrintbyFalcon
            - generic [ref=e10]: Atelier · Cairo est. 2025
        - navigation [ref=e11]:
          - link "Products" [ref=e12] [cursor=pointer]:
            - /url: /en/products
          - link "Ink" [ref=e13] [cursor=pointer]:
            - /url: /en/products?category=ink-cartridges
          - link "Printers" [ref=e14] [cursor=pointer]:
            - /url: /en/products?category=printers
          - link "Paper" [ref=e15] [cursor=pointer]:
            - /url: /en/products?category=paper-media
        - generic [ref=e19]:
          - img [ref=e20]
          - searchbox "Search products..." [ref=e22]
        - generic [ref=e23]:
          - link "ع" [ref=e24] [cursor=pointer]:
            - /url: /ar
          - link "Login" [ref=e25] [cursor=pointer]:
            - /url: /en/auth/login
          - button "Cart" [ref=e26] [cursor=pointer]:
            - img [ref=e27]
    - main [ref=e29]:
      - generic [ref=e30]:
        - generic [ref=e31]: 🔍
        - heading "404" [level=1] [ref=e32]
        - paragraph [ref=e33]: Page not found
        - paragraph [ref=e34]: The page you're looking for doesn't exist or has been moved.
        - link "Back to home" [ref=e35] [cursor=pointer]:
          - /url: /en
    - contentinfo [ref=e36]:
      - generic [ref=e37]:
        - heading "PrintbyFalcon" [level=2] [ref=e39]
        - generic [ref=e40]:
          - generic [ref=e41]:
            - paragraph [ref=e42]: Printing Atelier
            - paragraph [ref=e43]: A specialist supplier of genuine printing consumables in Egypt. Serving offices, designers, and studios since 2025.
          - generic [ref=e44]:
            - paragraph [ref=e45]: Catalog
            - list [ref=e46]:
              - listitem [ref=e47]:
                - link "All Products" [ref=e48] [cursor=pointer]:
                  - /url: /en/products
              - listitem [ref=e49]:
                - link "Ink" [ref=e50] [cursor=pointer]:
                  - /url: /en/products?category=ink-cartridges
              - listitem [ref=e51]:
                - link "Printers" [ref=e52] [cursor=pointer]:
                  - /url: /en/products?category=printers
              - listitem [ref=e53]:
                - link "Paper" [ref=e54] [cursor=pointer]:
                  - /url: /en/products?category=paper-media
          - generic [ref=e55]:
            - paragraph [ref=e56]: Account
            - list [ref=e57]:
              - listitem [ref=e58]:
                - link "Sign in" [ref=e59] [cursor=pointer]:
                  - /url: /en/auth/login
              - listitem [ref=e60]:
                - link "My account" [ref=e61] [cursor=pointer]:
                  - /url: /en/account
              - listitem [ref=e62]:
                - link "Orders" [ref=e63] [cursor=pointer]:
                  - /url: /en/account/orders
              - listitem [ref=e64]:
                - link "Support" [ref=e65] [cursor=pointer]:
                  - /url: /en/support
        - generic [ref=e66]:
          - generic [ref=e67]: © 2026 · PRINTBYFALCON · CAIRO, EGYPT
          - generic [ref=e68]:
            - generic [ref=e69]: EST. 2025
            - generic [ref=e70]: ✦
            - generic [ref=e71]: info@printbyfalcon.com
  - alert [ref=e72]
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
> 13 |     expect(res?.status()).toBe(404);
     |                           ^ Error: expect(received).toBe(expected) // Object.is equality
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
  27 |     expect(locs.length).toBeGreaterThan(5);
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