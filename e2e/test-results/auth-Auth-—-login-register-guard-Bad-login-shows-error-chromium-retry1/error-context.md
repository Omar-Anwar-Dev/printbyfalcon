# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth — login / register / guard >> Bad login shows error
- Location: tests\auth.spec.ts:22:7

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
  3  | test.describe('Auth — login / register / guard', () => {
  4  |   test('Login page renders editorial split layout', async ({ page }) => {
  5  |     await page.goto('/en/auth/login');
  6  |     await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  7  |     await expect(page.getByText(/№ 01/)).toBeVisible();
  8  |     await expect(page.getByLabel(/Email/i)).toBeVisible();
  9  |     await expect(page.getByLabel(/Password/i)).toBeVisible();
  10 |   });
  11 | 
  12 |   test('Login with seeded demo customer succeeds', async ({ page }) => {
  13 |     await page.goto('/en/auth/login');
  14 |     await page.getByLabel(/Email/i).fill('ahmed@example.com');
  15 |     await page.getByLabel(/Password/i).fill('Demo@Pass2025!');
  16 |     await page.getByRole('button', { name: /Sign in/i }).click();
  17 |     // Lands on /account
  18 |     await page.waitForURL(/\/en\/account/, { timeout: 10_000 });
  19 |     await expect(page.getByText(/Ahmed/i).first()).toBeVisible();
  20 |   });
  21 | 
  22 |   test('Bad login shows error', async ({ page }) => {
  23 |     await page.goto('/en/auth/login');
> 24 |     await page.getByLabel(/Email/i).fill('fake@test.com');
     |                                     ^ Error: locator.fill: Test timeout of 60000ms exceeded.
  25 |     await page.getByLabel(/Password/i).fill('wrongpass');
  26 |     await page.getByRole('button', { name: /Sign in/i }).click();
  27 |     // Some inline error should appear (red box or text)
  28 |     await expect(page.locator('text=/failed|invalid|Unauthorized/i').first()).toBeVisible({ timeout: 5000 });
  29 |   });
  30 | 
  31 |   test('Register page renders', async ({ page }) => {
  32 |     await page.goto('/en/auth/register');
  33 |     await expect(page.getByRole('heading', { name: /Join/i })).toBeVisible();
  34 |     await expect(page.getByLabel(/First name/i)).toBeVisible();
  35 |     await expect(page.getByLabel(/Password/i)).toBeVisible();
  36 |   });
  37 | 
  38 |   test('Forgot-password page renders', async ({ page }) => {
  39 |     await page.goto('/en/auth/forgot-password');
  40 |     await expect(page.getByRole('heading', { name: /Reset your password/i })).toBeVisible();
  41 |   });
  42 | 
  43 |   test('Account route redirects to login when unauthenticated', async ({ page }) => {
  44 |     await page.goto('/en/account');
  45 |     await page.waitForURL(/\/en\/auth\/login/, { timeout: 5000 });
  46 |   });
  47 | });
  48 | 
```