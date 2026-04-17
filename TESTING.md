# PrintByFalcon · Testing Guide

A hands-on walkthrough covering **customer storefront · admin panel · payment gateway · WhatsApp / email notifications**. Run the demo seed first, then follow each section.

---

## 1 · Demo Seed

Populates the database with realistic test data: 30 products · 6 users · 5 orders (varied statuses) · 4 coupons · 2 support tickets · 2 banners · 2 suppliers + 2 POs. Idempotent — safe to re-run.

```bash
# On the VPS
docker compose -f docker-compose.prod.yml exec nestjs-api npx ts-node prisma/seed-demo.ts

# Then re-sync Meilisearch so the 30 products are searchable
TOKEN=$(curl -s -X POST https://api.printbyfalcon.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@printbyfalcon.com","password":"Admin@PrintFalcon2025!"}' \
  | grep -oP '"accessToken":"[^"]+' | cut -d'"' -f4)
curl -s -X POST https://api.printbyfalcon.com/api/v1/admin/search/sync \
  -H "Authorization: Bearer $TOKEN"
```

### Test accounts

| Role | Email | Password |
|------|-------|----------|
| SUPERADMIN | admin@printbyfalcon.com | Admin@PrintFalcon2025! |
| SALES_MANAGER | sales@printbyfalcon.com | Demo@Pass2025! |
| CUSTOMER_SERVICE | support@printbyfalcon.com | Demo@Pass2025! |
| CUSTOMER | ahmed@example.com | Demo@Pass2025! |
| CUSTOMER | mona@example.com | Demo@Pass2025! |
| CUSTOMER | youssef@example.com | Demo@Pass2025! |

### Demo coupons

| Code | Effect | Minimum |
|------|--------|---------|
| `WELCOME10` | 10 % off | EGP 500 |
| `SAVE50` | Flat EGP 50 off | EGP 300 |
| `SHIPFREE` | Free shipping | EGP 1 000 |
| `EXPIRED` | Invalid (test rejection) | — |

---

## 2 · Customer Storefront Walkthrough

Open https://printbyfalcon.com in a browser.

### 2.1 Guest browsing
- [ ] Homepage: hero headline visible, paper-cream aesthetic loads
- [ ] Announcement bar shows free-shipping note
- [ ] Categories row shows 5 chapters (01 Printers → 05 Spare parts)
- [ ] Featured products grid shows ≥ 8 products
- [ ] Click **Products** → paginated catalogue with category sidebar
- [ ] Filter by `Ink Cartridges` → only ink products appear
- [ ] Click any product → detail page with SKU, stock, Add-to-Cart, Related Products

### 2.2 Search
- [ ] Type `hp` in navbar search → dropdown shows HP products
- [ ] Type `حبر` (Arabic) → dropdown shows ink products (synonym resolves)
- [ ] Type `lserjet` (typo) → still returns LaserJet matches (typo tolerance)

### 2.3 Cart (guest)
- [ ] Add 2 items to cart without logging in → cart badge updates
- [ ] Click cart icon → drawer opens with letterpress receipt header
- [ ] Adjust quantity, remove item — subtotal updates

### 2.4 Register / Login
- [ ] Open `/en/auth/register`
- [ ] Create account → lands on `/en/account`
- [ ] Log out from sidebar → redirected home
- [ ] Log back in with `ahmed@example.com` / `Demo@Pass2025!`

### 2.5 Address CRUD
- [ ] Account → Addresses → Add a new address
- [ ] Edit, mark as default, delete — all flows work

### 2.6 Checkout
- [ ] Add a product to cart → click **Checkout**
- [ ] Step 1 Address: pick a saved address → Continue
- [ ] Step 2 Shipping: standard delivery is selected (shows "Free" if ≥ 1500)
- [ ] Step 3 Payment: select COD · Card · Fawry in turn
- [ ] Step 4 Review:
  - Apply `WELCOME10` → −10 % visible
  - Apply `EXPIRED` → red rejection message
- [ ] Place order → success page; if Card/Fawry + Paymob configured, iframe/ref appears

### 2.7 Orders + Support
- [ ] Account → Orders → click any order → timeline + items + totals
- [ ] Account → Wishlist → add-to-wishlist from a product page, move to cart works
- [ ] Support → New ticket → create → see thread on detail page

---

## 3 · Admin Panel Walkthrough

Log in as `admin@printbyfalcon.com` then open `/en/admin`.

- [ ] Dashboard: KPI cards (revenue, pending orders, open tickets, low stock), revenue chart, top sellers list
- [ ] Products: search by `hp`, table shows matches, stock colour-coded
- [ ] Orders: filter by `status = SHIPPED`, `paymentMethod = FAWRY`, date range, customer search → table narrows
- [ ] Click an order → full detail with status-update form
- [ ] Choose `Status = DELIVERED` + courier `Aramex` → update persists, audit log records it
- [ ] Sign in as `sales@printbyfalcon.com` → dashboard visible, **no** access to user management
- [ ] Sign in as `support@printbyfalcon.com` → can see + reply to tickets, not edit products

---

## 4 · Payment Gateway

### 4.1 Mock mode (default, no Paymob credentials set)

With `PAYMOB_API_KEY` absent, the backend returns mock responses:
- **Card** → mock iframe URL like `https://paymob.mock/iframe/…` — the frontend will redirect; the mock URL won't load Paymob, but the order exists in DB with `status = PENDING_PAYMENT`
- **Fawry** → mock ref number (8-digit) shown on the success page
- **COD** → real path, no Paymob touched

### 4.2 Sandbox mode (real Paymob test keys)

In `/home/deploy/printbyfalcon/.env` on the VPS add:

```
PAYMOB_API_KEY=<your sandbox key from accept.paymob.com>
PAYMOB_INTEGRATION_ID_CARD=<card integration id>
PAYMOB_INTEGRATION_ID_FAWRY=<fawry integration id>
PAYMOB_HMAC_SECRET=<hmac secret>
PAYMOB_IFRAME_ID=<iframe id>
```

Then:

```bash
docker compose -f docker-compose.prod.yml restart nestjs-api
```

Test card (Paymob sandbox): `5123 4500 0000 0008` · any future expiry · CVV `100`

### 4.3 Webhook testing

Paymob sandbox won't reach `localhost`, but it can reach `https://api.printbyfalcon.com/api/v1/payments/callback`. Register that URL in the Paymob dashboard. On a successful payment:

```bash
# Watch the API log for the webhook:
docker compose -f docker-compose.prod.yml logs -f nestjs-api | grep -i 'paymob\|webhook\|HMAC'
```

Expected: `LOG [HTTP] POST /api/v1/payments/callback 200 · Xms` plus an `Order <id> payment confirmed` log line.

HMAC validation is covered by the unit tests — `cd apps/api && npx jest payments.service.spec`.

---

## 5 · WhatsApp Notifications

### 5.1 Mock mode (default, no Meta credentials set)

Notification attempts log to the API console — no outbound HTTP. Run a test COD order and watch:

```bash
docker compose -f docker-compose.prod.yml logs nestjs-api --tail=30 | grep -i whatsapp
```

Expected pattern: `MOCK WhatsApp → <phone> template=order_confirmation ...`

### 5.2 Live mode (Meta Cloud API)

Prerequisites:
1. Meta Business account + WhatsApp Business phone number (test number works)
2. 3 approved templates: `order_confirmation`, `order_status_update`, `payment_confirmed`
3. Access token + phone number id from Meta

Add to `.env`:

```
WHATSAPP_TOKEN=<EAA...>         # long-lived Meta token
PHONE_NUMBER_ID=<from Meta>      # the sending WhatsApp number id
```

Restart API:

```bash
docker compose -f docker-compose.prod.yml restart nestjs-api
```

Then place a COD order as `ahmed@example.com` (phone `+201012345678`). Within seconds you should receive:
1. `order_confirmation` WhatsApp template at the customer phone
2. HTML email to `ahmed@example.com` (if SMTP_* env vars are set)

To change the admin status → DELIVERED:

```bash
TOKEN=$(curl -s -X POST https://api.printbyfalcon.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@printbyfalcon.com","password":"Admin@PrintFalcon2025!"}' \
  | grep -oP '"accessToken":"[^"]+' | cut -d'"' -f4)

ORDER_ID=<copy from admin orders UI>
curl -X PATCH https://api.printbyfalcon.com/api/v1/admin/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"DELIVERED","courierName":"Aramex","trackingNumber":"AR-TEST-001"}'
```

Expected: `order_status_update` WhatsApp template lands on customer phone, plus an HTML email.

### 5.3 Email (Hostinger SMTP)

`.env` vars required:

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=notifications@printbyfalcon.com
SMTP_PASS=<mailbox password>
SMTP_FROM="PrintByFalcon <notifications@printbyfalcon.com>"
```

After restart, trigger the same COD order and check the customer mailbox.

---

## 6 · End-to-End automated checks

From your **dev machine** (not the VPS):

```bash
cd D:/Projects/PrintByFalcon/e2e
npm install
npx playwright install chromium
npx playwright test
```

Current suite (7 tests × 2 projects = 14 runs):
- Homepage atelier aesthetic · Shop Now navigation · autocomplete debounce
- Arabic RTL locale · /health reports all deps up
- Login split-screen renders · account gate redirects

---

## 7 · Observability during testing

```bash
# One line per request in realtime
docker compose -f docker-compose.prod.yml logs -f nestjs-api | grep HTTP

# Ongoing errors
docker compose -f docker-compose.prod.yml logs -f nestjs-api | grep -iE 'error|warn'

# Redis cache keys
docker compose -f docker-compose.prod.yml exec redis-cache redis-cli KEYS "*"

# Meilisearch index size
docker compose -f docker-compose.prod.yml exec nestjs-api node -e '
  const axios = require("axios");
  axios.get(process.env.MEILI_HOST + "/indexes/products/stats", {
    headers: { Authorization: "Bearer " + process.env.MEILI_MASTER_KEY }
  }).then(r => console.log(r.data));
'
```
