import { test, expect } from '@playwright/test';

test.describe('Auth — login / register / guard', () => {
  test('Login page renders editorial split layout', async ({ page }) => {
    await page.goto('/en/auth/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByText(/№ 01/)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
  });

  test('Login with seeded demo customer succeeds', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.getByLabel(/Email/i).fill('ahmed@example.com');
    await page.getByLabel(/Password/i).fill('Demo@Pass2025!');
    await page.getByRole('button', { name: /Sign in/i }).click();
    // Lands on /account
    await page.waitForURL(/\/en\/account/, { timeout: 10_000 });
    await expect(page.getByText(/Ahmed/i).first()).toBeVisible();
  });

  test('Bad login shows error', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.getByLabel(/Email/i).fill('fake@test.com');
    await page.getByLabel(/Password/i).fill('wrongpass');
    await page.getByRole('button', { name: /Sign in/i }).click();
    // Some inline error should appear (red box or text)
    await expect(page.locator('text=/failed|invalid|Unauthorized/i').first()).toBeVisible({ timeout: 5000 });
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
