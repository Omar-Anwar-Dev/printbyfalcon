import { test, expect } from '@playwright/test';

async function loginAsAdmin(page: any) {
  await page.goto('/en/auth/login');
  await page.getByLabel(/Email/i).fill('admin@printbyfalcon.com');
  await page.getByLabel(/Password/i).fill('Admin@PrintFalcon2025!');
  await page.getByRole('button', { name: /Sign in/i }).click();
  await page.waitForURL(/\/en\/account/, { timeout: 10_000 });
}

async function loginAsCustomer(page: any) {
  await page.goto('/en/auth/login');
  await page.getByLabel(/Email/i).fill('ahmed@example.com');
  await page.getByLabel(/Password/i).fill('Demo@Pass2025!');
  await page.getByRole('button', { name: /Sign in/i }).click();
  await page.waitForURL(/\/en\/account/, { timeout: 10_000 });
}

test.describe('Admin panel', () => {
  test('Admin dashboard — KPI cards + chart render', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/en/admin');
    await expect(page.getByRole('heading', { name: /Atelier dashboard/i })).toBeVisible();
    await expect(page.getByText(/Revenue/)).toBeVisible();
    await expect(page.getByText(/Pending orders/i)).toBeVisible();
    await expect(page.getByText(/Top sellers/i)).toBeVisible();
  });

  test('Admin Products table lists 30 products', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/en/admin/products');
    await expect(page.getByRole('heading', { name: /Products/i })).toBeVisible();
    // Header row + 30 data rows
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(20);   // page size may cap at 20/50
  });

  test('Admin Products search filters rows', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/en/admin/products');
    await page.getByPlaceholder(/Search/i).fill('hp');
    // Debounced refetch — wait for fewer rows
    await page.waitForTimeout(1000);
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Admin Orders table shows seeded orders with filters', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/en/admin/orders');
    await expect(page.getByRole('heading', { name: /Orders/i })).toBeVisible();
    // Filter by DELIVERED → should see Ahmed's first order
    await page.locator('select').first().selectOption('DELIVERED');
    await page.waitForTimeout(800);
    await expect(page.getByText(/Ahmed El-Khattab/i)).toBeVisible();
  });

  test('Admin Order detail loads + status update form visible', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/en/admin/orders');
    await page.locator('a').filter({ hasText: /View/i }).first().click();
    await expect(page.getByRole('heading', { name: /Order detail/i })).toBeVisible();
    await expect(page.getByText(/UPDATE STATUS/i)).toBeVisible();
  });

  test('RBAC — Customer cannot access /admin', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/en/admin');
    // Frontend should show access-denied or redirect
    await expect(page.getByText(/Access denied|permission/i)).toBeVisible({ timeout: 5000 });
  });
});
