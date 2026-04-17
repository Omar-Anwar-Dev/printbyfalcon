# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: account.spec.ts >> Account pages >> Wishlist page renders (empty state OK)
- Location: tests\account.spec.ts:48:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByLabel(/Email/i)

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
        - complementary [ref=e31]:
          - generic: P
          - link "✦ PrintbyFalcon" [ref=e33] [cursor=pointer]:
            - /url: /en
            - generic [ref=e34]: ✦
            - generic [ref=e35]: PrintbyFalcon
          - generic [ref=e36]:
            - paragraph [ref=e37]: From the atelier
            - blockquote [ref=e38]:
              - text: “Good printing
              - text: never loses
              - text: the original thought.”
            - paragraph [ref=e39]: — Old pressman&rsquo;s adage
          - generic [ref=e40]:
            - generic [ref=e41]: EST. CAIRO · MMXXV
            - generic [ref=e42]: ✦
        - main [ref=e43]:
          - generic [ref=e46]:
            - paragraph [ref=e47]: № 01 · RETURNING
            - heading "Welcome back" [level=1] [ref=e48]
            - paragraph [ref=e49]: Enter your details to continue to your account.
            - generic [ref=e50]:
              - generic [ref=e51]:
                - generic [ref=e52]: Email
                - textbox "name@studio.com" [ref=e53]
              - generic [ref=e54]:
                - generic [ref=e55]:
                  - generic [ref=e56]: Password
                  - link "Forgot?" [ref=e57] [cursor=pointer]:
                    - /url: /en/auth/forgot-password
                - textbox "••••••••" [ref=e58]
              - button "Sign in →" [ref=e59] [cursor=pointer]:
                - text: Sign in
                - generic [ref=e60]: →
              - generic [ref=e62]: OR
              - paragraph [ref=e63]:
                - text: New here?
                - link "Create an account" [ref=e64] [cursor=pointer]:
                  - /url: /en/auth/register
    - contentinfo [ref=e65]:
      - generic [ref=e66]:
        - heading "PrintbyFalcon" [level=2] [ref=e68]
        - generic [ref=e69]:
          - generic [ref=e70]:
            - paragraph [ref=e71]: Printing Atelier
            - paragraph [ref=e72]: A specialist supplier of genuine printing consumables in Egypt. Serving offices, designers, and studios since 2025.
          - generic [ref=e73]:
            - paragraph [ref=e74]: Catalog
            - list [ref=e75]:
              - listitem [ref=e76]:
                - link "All Products" [ref=e77] [cursor=pointer]:
                  - /url: /en/products
              - listitem [ref=e78]:
                - link "Ink" [ref=e79] [cursor=pointer]:
                  - /url: /en/products?category=ink-cartridges
              - listitem [ref=e80]:
                - link "Printers" [ref=e81] [cursor=pointer]:
                  - /url: /en/products?category=printers
              - listitem [ref=e82]:
                - link "Paper" [ref=e83] [cursor=pointer]:
                  - /url: /en/products?category=paper-media
          - generic [ref=e84]:
            - paragraph [ref=e85]: Account
            - list [ref=e86]:
              - listitem [ref=e87]:
                - link "Sign in" [ref=e88] [cursor=pointer]:
                  - /url: /en/auth/login
              - listitem [ref=e89]:
                - link "My account" [ref=e90] [cursor=pointer]:
                  - /url: /en/account
              - listitem [ref=e91]:
                - link "Orders" [ref=e92] [cursor=pointer]:
                  - /url: /en/account/orders
              - listitem [ref=e93]:
                - link "Support" [ref=e94] [cursor=pointer]:
                  - /url: /en/support
        - generic [ref=e95]:
          - generic [ref=e96]: © 2026 · PRINTBYFALCON · CAIRO, EGYPT
          - generic [ref=e97]:
            - generic [ref=e98]: EST. 2025
            - generic [ref=e99]: ✦
            - generic [ref=e100]: info@printbyfalcon.com
  - alert [ref=e101]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Shared login helper
  4  | async function loginAsCustomer(page: any) {
  5  |   await page.goto('/en/auth/login');
> 6  |   await page.getByLabel(/Email/i).fill('ahmed@example.com');
     |                                   ^ Error: locator.fill: Test timeout of 60000ms exceeded.
  7  |   await page.getByLabel(/Password/i).fill('Demo@Pass2025!');
  8  |   await page.getByRole('button', { name: /Sign in/i }).click();
  9  |   await page.waitForURL(/\/en\/account/, { timeout: 10_000 });
  10 | }
  11 | 
  12 | test.describe('Account pages', () => {
  13 |   test('Overview shows stat cards with real numbers', async ({ page }) => {
  14 |     await loginAsCustomer(page);
  15 |     // 3 stat cards — Orders, Addresses, Wishlist
  16 |     await expect(page.getByRole('link', { name: /Orders/i }).first()).toBeVisible();
  17 |     await expect(page.getByRole('link', { name: /Addresses/i }).first()).toBeVisible();
  18 |   });
  19 | 
  20 |   test('Orders list shows 2 seeded orders', async ({ page }) => {
  21 |     await loginAsCustomer(page);
  22 |     await page.goto('/en/account/orders');
  23 |     await expect(page.getByRole('heading', { name: /My Orders/i })).toBeVisible();
  24 |     // At least 2 invoice numbers visible (FLN- pattern)
  25 |     const invoices = page.getByText(/FLN-\d{8}-\d{4}/);
  26 |     const count = await invoices.count();
  27 |     expect(count).toBeGreaterThanOrEqual(2);
  28 |   });
  29 | 
  30 |   test('Order detail shows tracking timeline + totals', async ({ page }) => {
  31 |     await loginAsCustomer(page);
  32 |     await page.goto('/en/account/orders');
  33 |     // Click first order row
  34 |     await page.locator('a[href*="/en/account/orders/"]').first().click();
  35 |     await expect(page.getByRole('heading', { name: /Order details/i })).toBeVisible();
  36 |     await expect(page.getByText(/Subtotal/i)).toBeVisible();
  37 |     await expect(page.getByText(/Total/i)).toBeVisible();
  38 |   });
  39 | 
  40 |   test('Addresses page shows Ahmed default address', async ({ page }) => {
  41 |     await loginAsCustomer(page);
  42 |     await page.goto('/en/account/addresses');
  43 |     await expect(page.getByRole('heading', { name: /Addresses/i })).toBeVisible();
  44 |     await expect(page.getByText(/Ahmed El-Khattab/i)).toBeVisible();
  45 |     await expect(page.getByText(/Default/i).first()).toBeVisible();
  46 |   });
  47 | 
  48 |   test('Wishlist page renders (empty state OK)', async ({ page }) => {
  49 |     await loginAsCustomer(page);
  50 |     await page.goto('/en/account/wishlist');
  51 |     await expect(page.getByRole('heading', { name: /Wishlist/i })).toBeVisible();
  52 |   });
  53 | 
  54 |   test('Support tickets list', async ({ page }) => {
  55 |     await loginAsCustomer(page);
  56 |     await page.goto('/en/support');
  57 |     await expect(page.getByRole('heading', { name: /Tickets/i })).toBeVisible();
  58 |     // Ahmed has 1 seeded ticket
  59 |     await expect(page.getByText(/HP 680 cartridge is not recognised/i)).toBeVisible();
  60 |   });
  61 | 
  62 |   test('Sign out clears session', async ({ page }) => {
  63 |     await loginAsCustomer(page);
  64 |     await page.getByRole('button', { name: /Sign out/i }).click();
  65 |     // After logout the account page should redirect
  66 |     await page.goto('/en/account');
  67 |     await page.waitForURL(/\/en\/auth\/login/, { timeout: 5000 });
  68 |   });
  69 | });
  70 | 
```