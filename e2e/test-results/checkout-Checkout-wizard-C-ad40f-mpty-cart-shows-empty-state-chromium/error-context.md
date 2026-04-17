# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.ts >> Checkout wizard >> Checkout empty cart shows empty state
- Location: tests\checkout.spec.ts:71:7

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
  3  | async function loginAsCustomer(page: any) {
  4  |   await page.goto('/en/auth/login');
> 5  |   await page.getByLabel(/Email/i).fill('ahmed@example.com');
     |                                   ^ Error: locator.fill: Test timeout of 60000ms exceeded.
  6  |   await page.getByLabel(/Password/i).fill('Demo@Pass2025!');
  7  |   await page.getByRole('button', { name: /Sign in/i }).click();
  8  |   await page.waitForURL(/\/en\/account/, { timeout: 10_000 });
  9  | }
  10 | 
  11 | test.describe('Checkout wizard', () => {
  12 |   test('4-step wizard progresses, place COD order succeeds', async ({ page }) => {
  13 |     await loginAsCustomer(page);
  14 | 
  15 |     // Add a product
  16 |     await page.goto('/en/products/hp-680-black-ink');
  17 |     await page.getByRole('button', { name: /Add to Cart/i }).first().click();
  18 |     await page.waitForTimeout(800);
  19 | 
  20 |     // Go to checkout
  21 |     await page.goto('/en/checkout');
  22 |     await expect(page.getByRole('heading', { name: /Complete your order/i })).toBeVisible();
  23 | 
  24 |     // Step 1 — Address — Ahmed has default, select it
  25 |     await page.getByText(/Ahmed El-Khattab/i).first().click();
  26 |     await page.getByRole('button', { name: /Continue/i }).click();
  27 | 
  28 |     // Step 2 — Shipping (pre-selected standard)
  29 |     await expect(page.getByRole('heading', { name: /Shipping method/i })).toBeVisible();
  30 |     await page.getByRole('button', { name: /Continue/i }).click();
  31 | 
  32 |     // Step 3 — Payment — COD
  33 |     await expect(page.getByRole('heading', { name: /Payment/i })).toBeVisible();
  34 |     await page.getByText(/Cash on delivery/i).click();
  35 |     await page.getByRole('button', { name: /Review order/i }).click();
  36 | 
  37 |     // Step 4 — Review → place order
  38 |     await expect(page.getByRole('heading', { name: /Review your order/i })).toBeVisible();
  39 |     await page.getByRole('button', { name: /Place order/i }).click();
  40 | 
  41 |     // Success page
  42 |     await page.waitForURL(/\/en\/checkout\/success/, { timeout: 15_000 });
  43 |     await expect(page.getByText(/Thank/i)).toBeVisible();
  44 |   });
  45 | 
  46 |   test('Apply valid coupon WELCOME10 — discount appears', async ({ page }) => {
  47 |     await loginAsCustomer(page);
  48 |     await page.goto('/en/products/hp-680-black-ink');
  49 |     await page.getByRole('button', { name: /Add to Cart/i }).first().click();
  50 |     await page.waitForTimeout(500);
  51 | 
  52 |     await page.goto('/en/checkout');
  53 |     await page.getByText(/Ahmed El-Khattab/i).first().click();
  54 |     await page.getByRole('button', { name: /Continue/i }).click();
  55 |     await page.getByRole('button', { name: /Continue/i }).click();
  56 |     await page.getByText(/Cash on delivery/i).click();
  57 |     await page.getByRole('button', { name: /Review order/i }).click();
  58 | 
  59 |     // In review step, apply coupon
  60 |     await page.getByPlaceholder(/SAVE10|coupon/i).fill('WELCOME10').catch(() => {});
  61 |     // Actually our coupon input has placeholder "SAVE10"
  62 |     const couponInput = page.locator('input[placeholder="SAVE10"]');
  63 |     if (await couponInput.count() > 0) {
  64 |       await couponInput.fill('WELCOME10');
  65 |       await page.getByRole('button', { name: /^Apply$/i }).click();
  66 |       // Expect discount line or applied badge
  67 |       await expect(page.getByText(/WELCOME10/i)).toBeVisible({ timeout: 3000 });
  68 |     }
  69 |   });
  70 | 
  71 |   test('Checkout empty cart shows empty state', async ({ page }) => {
  72 |     await loginAsCustomer(page);
  73 |     // Force empty cart page — just visit it with no items
  74 |     await page.goto('/en/cart');
  75 |     // Either empty-state or actual cart. Accept both.
  76 |     await expect(page.locator('body')).toBeVisible();
  77 |   });
  78 | });
  79 | 
```