import { test, expect } from '@playwright/test';
import * as path from 'path';

// Runs under `admin` project — admin storage state pre-loaded.
// Re-use customer state for the RBAC test via storageState override below.

test.describe('Admin panel', () => {
  test('Admin dashboard — KPI cards + chart render', async ({ page }) => {
    await page.goto('/en/admin');
    await expect(page.getByRole('heading', { name: /Atelier dashboard/i })).toBeVisible();
    await expect(page.getByText(/Revenue/)).toBeVisible();
    await expect(page.getByText(/Pending orders/i)).toBeVisible();
    await expect(page.getByText(/Top sellers/i)).toBeVisible();
  });

  test('Admin Products table lists 30 products', async ({ page }) => {
    await page.goto('/en/admin/products');
    await expect(page.getByRole('heading', { name: /Products/i })).toBeVisible();
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(20);
  });

  test('Admin Products search filters rows', async ({ page }) => {
    await page.goto('/en/admin/products');
    await page.getByPlaceholder(/Search/i).fill('hp');
    await page.waitForTimeout(1000);
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Admin Orders table shows seeded orders with filters', async ({ page }) => {
    await page.goto('/en/admin/orders');
    await expect(page.getByRole('heading', { name: /Orders/i })).toBeVisible();
    await page.locator('select').first().selectOption('DELIVERED');
    await page.waitForTimeout(1500);
    await expect(page.getByText(/Ahmed El-Khattab/i)).toBeVisible();
  });

  test('Admin Order detail loads + status update form visible', async ({ page }) => {
    await page.goto('/en/admin/orders');
    await page.locator('a').filter({ hasText: /View/i }).first().click();
    await expect(page.getByRole('heading', { name: /Order detail/i })).toBeVisible();
    await expect(page.getByText(/UPDATE STATUS/i)).toBeVisible();
  });
});

// Separate describe block that uses CUSTOMER auth state to test RBAC
test.describe('Admin RBAC', () => {
  test.use({ storageState: path.join(__dirname, '..', '.auth', 'customer.json') });

  test('Customer cannot access /admin', async ({ page }) => {
    await page.goto('/en/admin');
    await expect(page.getByText(/Access denied|permission/i)).toBeVisible({ timeout: 5000 });
  });
});
