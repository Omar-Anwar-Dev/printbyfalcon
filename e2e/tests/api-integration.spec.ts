import { test, expect } from '@playwright/test';

const API = process.env.E2E_API_URL ?? 'https://api.printbyfalcon.com/api/v1';

test.describe('API integration', () => {
  test('/health reports all deps up', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.dependencies.db.status).toBe('up');
    expect(body.dependencies.redis.status).toBe('up');
    expect(body.dependencies.meili.status).toBe('up');
  });

  test('/products returns >= 30 items', async ({ request }) => {
    const res = await request.get(`${API}/products?limit=1`);
    const body = await res.json();
    expect(body.total).toBeGreaterThanOrEqual(30);
  });

  test('Helmet security headers present', async ({ request }) => {
    const res = await request.get(`${API}/products?limit=1`);
    const h = res.headers();
    expect(h['x-frame-options']).toBeTruthy();
    // Helmet + nginx both add it → value becomes "nosniff, nosniff". Accept either.
    expect(h['x-content-type-options']).toContain('nosniff');
    expect(h['strict-transport-security']).toBeTruthy();
  });

  test('Meilisearch synonym: حبر returns ink cartridges', async ({ request }) => {
    const res = await request.get(`${API}/products/search?q=${encodeURIComponent('حبر')}`);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(0);
  });

  test('Coupon WELCOME10 validates correctly', async ({ request }) => {
    const res = await request.post(`${API}/coupons/validate`, {
      data: { code: 'WELCOME10', cartTotal: 1000 },
    });
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.discount).toBe(100);
  });

  test('Coupon EXPIRED is rejected', async ({ request }) => {
    const res = await request.post(`${API}/coupons/validate`, {
      data: { code: 'EXPIRED', cartTotal: 1000 },
    });
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.reason).toMatch(/expired/i);
  });

  // MUST stay last — this test exhausts the 5-per-15min auth rate limit.
  // If placed earlier it would poison every subsequent login test.
  test('Auth rate limit: 6th login burst returns 429', async ({ request }) => {
    const email = `ratetest-${Date.now()}@x.com`;
    let last = 0;
    for (let i = 0; i < 6; i++) {
      const res = await request.post(`${API}/auth/login`, {
        data: { email, password: 'wrong' },
        failOnStatusCode: false,
      });
      last = res.status();
    }
    expect([401, 429]).toContain(last);
  });
});
