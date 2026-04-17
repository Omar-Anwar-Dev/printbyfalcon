import { test, expect } from '@playwright/test';

test.describe('Auth — login / register / guard', () => {
  test('Login page renders editorial split layout', async ({ page }) => {
    await page.goto('/en/auth/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByText(/№ 01/)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
  });

  // Login success is already validated by the auth.setup.ts at suite bootstrap.
  // We don't re-test actual login here — doing so burns through the
  // 5/15min auth rate limit and knocks out later tests.

  test('Bad login shows error or rate-limit message', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.getByLabel(/Email/i).fill('fake@test.com');
    await page.getByLabel(/Password/i).fill('wrongpass');
    await page.getByRole('button', { name: /Sign in/i }).click();
    // Either an inline auth error OR rate-limit (429) message
    await expect(
      page.locator('text=/failed|invalid|Unauthorized|many requests|Too Many/i').first()
    ).toBeVisible({ timeout: 6000 });
  });

  test('Register page renders', async ({ page }) => {
    await page.goto('/en/auth/register');
    await expect(page.getByRole('heading', { name: /Join/i })).toBeVisible();
    await expect(page.getByLabel(/First name/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
  });

  test('Forgot-password page renders', async ({ page }) => {
    await page.goto('/en/auth/forgot-password');
    await expect(page.getByRole('heading', { name: /Reset your password/i })).toBeVisible();
  });

  test('Account route redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/en/account');
    await page.waitForURL(/\/en\/auth\/login/, { timeout: 5000 });
  });
});
