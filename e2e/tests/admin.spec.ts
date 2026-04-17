import { test, expect } from '@playwright/test';
import * as path from 'path';

// Runs under `admin` project — admin storage state pre-loaded.

test.describe('Admin panel', () => {
  test('Admin dashboard — KPI cards + chart render', async ({ page }) => {
    await page.goto('/en/admin');
    await expect(page.getByRole('heading', { name: /Atelier dashboard/i })).toBeVisible();
    // "Revenue" appears twice (KPI card + chart heading) → first() resolves ambiguity
    await expect(page.getByText(/Revenue/).first()).toBeVisible();
    await expect(page.getByText(/Pending orders/i)).toBeVisible();
    await expect(page.getByText(/Top sellers/i)).toBeVisible();
  });

  test('Admin Products table lists products', async ({ page }) => {
    await page.goto('/en/admin/products');
    await expect(page.getByRole('heading', { name: /^Products$/i }).first()).toBeVisible();
    // Wait for the query to resolve — "Loading…" row gets replaced
    await expect.poll(async () => await page.locator('tbody tr').count(), {
      timeout: 15_000,
    }).toBeGreaterThanOrEqual(5);
  });

  test('Admin Products search filters rows', async ({ page }) => {
    await page.goto('/en/admin/products');
    // Scope to the admin search — there are two search inputs (navbar + admin)
    await page.getByPlaceholder(/Search by name/i).fill('hp');
    await page.waitForTimeout(1500);
    const count = await page.locator('tbody tr').count();
    expect(count).toBeGreaterThan(0);
  });

  test('Admin Orders table shows seeded orders with filters', async ({ page }) => {
    await page.goto('/en/admin/orders');
    await expect(page.getByRole('heading', { name: /^Orders$/i }).first()).toBeVisible();
    await page.locator('select').first().selectOption('DELIVERED');
    await page.waitForTimeout(1500);
    await expect(page.getByText(/Ahmed El-Khattab/i)).toBeVisible();
  });

  test('Admin Order detail loads + status update form visible', async ({ page }) => {
    await page.goto('/en/admin/orders');
    // Give the orders query a moment to populate
    await page.waitForTimeout(2000);
    await page.locator('a').filter({ hasText: /^View/i }).first().click();
    await expect(page.getByRole('heading', { name: /Order detail/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/UPDATE STATUS/i)).toBeVisible();
  });
});

// Separate describe uses CUSTOMER state for RBAC
test.describe('Admin RBAC', () => {
  test.use({ storageState: path.join(__dirname, '..', '.auth', 'customer.json') });

  test('Customer cannot access /admin', async ({ page }) => {
    await page.goto('/en/admin');
    await expect(page.getByRole('heading', { name: /Access denied/i })).toBeVisible({ timeout: 8000 });
  });
});
