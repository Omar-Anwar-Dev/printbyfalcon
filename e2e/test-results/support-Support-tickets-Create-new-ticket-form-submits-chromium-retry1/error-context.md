# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: support.spec.ts >> Support tickets >> Create new ticket form submits
- Location: tests\support.spec.ts:27:7

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
  11 | test.describe('Support tickets', () => {
  12 |   test('Tickets list shows seeded ticket with priority badge', async ({ page }) => {
  13 |     await loginAsCustomer(page);
  14 |     await page.goto('/en/support');
  15 |     await expect(page.getByText(/HIGH/)).toBeVisible();
  16 |     await expect(page.getByText(/HP 680 cartridge is not recognised/i)).toBeVisible();
  17 |   });
  18 | 
  19 |   test('Ticket detail shows reply thread', async ({ page }) => {
  20 |     await loginAsCustomer(page);
  21 |     await page.goto('/en/support');
  22 |     await page.locator('a[href*="/en/support/"]').filter({ hasText: /HP 680/i }).first().click();
  23 |     await expect(page.getByText(/I just installed/i)).toBeVisible();
  24 |     await expect(page.getByText(/Team/i).first()).toBeVisible();
  25 |   });
  26 | 
  27 |   test('Create new ticket form submits', async ({ page }) => {
  28 |     await loginAsCustomer(page);
  29 |     await page.goto('/en/support/new');
  30 |     await page.getByLabel(/Subject/i).fill('E2E test ticket ' + Date.now());
  31 |     await page.getByLabel(/Message/i).fill('This is an automated end-to-end test ticket. Please ignore.');
  32 |     await page.getByRole('button', { name: /Submit ticket/i }).click();
  33 |     // Redirects to /support/:id with the subject visible
  34 |     await page.waitForURL(/\/en\/support\/[a-z0-9-]+/, { timeout: 10_000 });
  35 |     await expect(page.getByText(/E2E test ticket/)).toBeVisible();
  36 |   });
  37 | });
  38 | 
```