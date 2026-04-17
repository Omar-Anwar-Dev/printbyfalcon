# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: catalog.spec.ts >> Catalog >> Product detail page renders full info + JSON-LD
- Location: tests\catalog.spec.ts:21:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /HP 680 Black Ink Cartridge/i })
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByRole('heading', { name: /HP 680 Black Ink Cartridge/i })

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
  3  | test.describe('Catalog', () => {
  4  |   test('Products list shows 20 per page + category sidebar', async ({ page }) => {
  5  |     await page.goto('/en/products');
  6  |     await expect(page.getByRole('heading', { name: /All Products/i })).toBeVisible();
  7  |     const cards = page.locator('a[href*="/en/products/"]').filter({ has: page.locator('img, div').first() });
  8  |     // Should have at least 8 product cards rendered on first page
  9  |     const count = await cards.count();
  10 |     expect(count).toBeGreaterThanOrEqual(8);
  11 |   });
  12 | 
  13 |   test('Category filter narrows results', async ({ page }) => {
  14 |     await page.goto('/en/products?category=ink-cartridges');
  15 |     await expect(page).toHaveURL(/category=ink-cartridges/);
  16 |     // At least one product visible after filter
  17 |     const count = await page.locator('a[href*="/en/products/"]').count();
  18 |     expect(count).toBeGreaterThan(0);
  19 |   });
  20 | 
  21 |   test('Product detail page renders full info + JSON-LD', async ({ page }) => {
  22 |     await page.goto('/en/products/hp-680-black-ink');
> 23 |     await expect(page.getByRole('heading', { name: /HP 680 Black Ink Cartridge/i })).toBeVisible();
     |                                                                                      ^ Error: expect(locator).toBeVisible() failed
  24 |     await expect(page.getByText(/SKU/i).first()).toBeVisible();
  25 |     await expect(page.getByText(/HP-680-BK/)).toBeVisible();
  26 |     await expect(page.getByRole('button', { name: /Add to Cart/i })).toBeVisible();
  27 | 
  28 |     // Breadcrumbs present
  29 |     await expect(page.getByText(/Home/).first()).toBeVisible();
  30 | 
  31 |     // JSON-LD structured data
  32 |     const ldScript = page.locator('script[type="application/ld+json"]').first();
  33 |     const ldText = await ldScript.textContent();
  34 |     expect(ldText).toContain('"@type":"Product"');
  35 |     expect(ldText).toContain('"sku":"HP-680-BK"');
  36 |   });
  37 | 
  38 |   test('Related Products section on detail page', async ({ page }) => {
  39 |     await page.goto('/en/products/hp-680-black-ink');
  40 |     await expect(page.getByRole('heading', { name: /Compatible Products/i })).toBeVisible();
  41 |   });
  42 | 
  43 |   test('Pagination controls appear when results exceed one page', async ({ page }) => {
  44 |     await page.goto('/en/products');
  45 |     // 30 products / 20 per page → at least 2 pages → page buttons visible
  46 |     const pageButtons = page.locator('a[href*="page="]');
  47 |     const visible = await pageButtons.count();
  48 |     expect(visible).toBeGreaterThan(0);
  49 |   });
  50 | });
  51 | 
```