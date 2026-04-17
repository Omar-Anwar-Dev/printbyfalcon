# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-integration.spec.ts >> API integration >> Helmet + gzip headers present
- Location: tests\api-integration.spec.ts:36:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "nosniff"
Received: "nosniff, nosniff"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const API = process.env.E2E_API_URL ?? 'https://api.printbyfalcon.com/api/v1';
  4  | 
  5  | test.describe('API integration', () => {
  6  |   test('/health reports all deps up', async ({ request }) => {
  7  |     const res = await request.get(`${API}/health`);
  8  |     expect(res.ok()).toBeTruthy();
  9  |     const body = await res.json();
  10 |     expect(body.status).toBe('ok');
  11 |     expect(body.dependencies.db.status).toBe('up');
  12 |     expect(body.dependencies.redis.status).toBe('up');
  13 |     expect(body.dependencies.meili.status).toBe('up');
  14 |   });
  15 | 
  16 |   test('/products returns >= 30 items', async ({ request }) => {
  17 |     const res = await request.get(`${API}/products?limit=1`);
  18 |     const body = await res.json();
  19 |     expect(body.total).toBeGreaterThanOrEqual(30);
  20 |   });
  21 | 
  22 |   test('Auth rate limit: 6th login in 15min = 429', async ({ request }) => {
  23 |     // Use a unique email so other tests don't interfere
  24 |     const email = `ratetest-${Date.now()}@x.com`;
  25 |     let last = 0;
  26 |     for (let i = 0; i < 6; i++) {
  27 |       const res = await request.post(`${API}/auth/login`, {
  28 |         data: { email, password: 'wrong' },
  29 |         failOnStatusCode: false,
  30 |       });
  31 |       last = res.status();
  32 |     }
  33 |     expect([401, 429]).toContain(last);
  34 |   });
  35 | 
  36 |   test('Helmet + gzip headers present', async ({ request }) => {
  37 |     const res = await request.get(`${API}/products?limit=1`, {
  38 |       headers: { 'Accept-Encoding': 'gzip' },
  39 |     });
  40 |     const h = res.headers();
  41 |     expect(h['x-frame-options']).toBeTruthy();
> 42 |     expect(h['x-content-type-options']).toBe('nosniff');
     |                                         ^ Error: expect(received).toBe(expected) // Object.is equality
  43 |     expect(h['strict-transport-security']).toBeTruthy();
  44 |     expect(h['content-encoding']).toBe('gzip');
  45 |   });
  46 | 
  47 |   test('Meilisearch synonym: حبر returns ink cartridges', async ({ request }) => {
  48 |     const res = await request.get(`${API}/products/search?q=${encodeURIComponent('حبر')}`);
  49 |     const body = await res.json();
  50 |     expect(body.total).toBeGreaterThan(0);
  51 |   });
  52 | 
  53 |   test('Coupon WELCOME10 validates correctly', async ({ request }) => {
  54 |     const res = await request.post(`${API}/coupons/validate`, {
  55 |       data: { code: 'WELCOME10', cartTotal: 1000 },
  56 |     });
  57 |     const body = await res.json();
  58 |     expect(body.valid).toBe(true);
  59 |     expect(body.discount).toBe(100);
  60 |   });
  61 | 
  62 |   test('Coupon EXPIRED is rejected', async ({ request }) => {
  63 |     const res = await request.post(`${API}/coupons/validate`, {
  64 |       data: { code: 'EXPIRED', cartTotal: 1000 },
  65 |     });
  66 |     const body = await res.json();
  67 |     expect(body.valid).toBe(false);
  68 |     expect(body.reason).toMatch(/expired/i);
  69 |   });
  70 | });
  71 | 
```