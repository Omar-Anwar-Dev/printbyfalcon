# PrintByFalcon · E2E Suite

Comprehensive Playwright browser tests targeting the live site at https://printbyfalcon.com.

## One-time setup (on your dev machine)

```bash
cd D:/Projects/PrintByFalcon/e2e
npm install
npx playwright install chromium webkit   # headless browsers
```

## Run the full suite

```bash
# Everything (desktop Chrome + mobile Safari)
npx playwright test

# Just the desktop tests
npx playwright test --project=chromium

# Just the mobile tests
npx playwright test --project=mobile-safari

# Single file in headed mode (watch the browser run)
npx playwright test auth.spec.ts --headed

# Show HTML report after a run
npx playwright show-report
```

## Suites

| File | Tests | Scope |
|------|-------|-------|
| `homepage.spec.ts` | 4 | Hero, RTL, featured grid, footer |
| `catalog.spec.ts` | 5 | List, filters, detail, JSON-LD, related |
| `search.spec.ts` | 4 | Autocomplete, Arabic synonyms, submit, typo |
| `cart.spec.ts` | 3 | Guest add, drawer, /cart page |
| `auth.spec.ts` | 6 | Login, register, forgot, error, guard |
| `account.spec.ts` | 7 | Overview, orders, addresses, wishlist, support, signout |
| `checkout.spec.ts` | 3 | 4-step wizard, coupon, empty state |
| `support.spec.ts` | 3 | List, thread, create |
| `admin.spec.ts` | 6 | Dashboard, products, orders, RBAC |
| `error-pages.spec.ts` | 5 | 404, sitemap, robots |
| `responsive.spec.ts` | 3 | Mobile viewport, hamburger, cart drawer |
| `api-integration.spec.ts` | 7 | Health, rate limit, Helmet, gzip, coupons |

**Total: ~56 tests** across 12 files.

## Environment variables

```bash
E2E_BASE_URL=https://printbyfalcon.com       # storefront base (default)
E2E_API_URL=https://api.printbyfalcon.com/api/v1   # API base
```

Override for a staging environment:

```bash
E2E_BASE_URL=https://staging.printbyfalcon.com npx playwright test
```
