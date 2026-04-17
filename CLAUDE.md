# PrintByFalcon — Project Context & Handoff Document
**Last Updated:** Day 11 Complete
**VPS:** Hostinger Web Terminal (already connected as deploy user)
**Repo:** https://github.com/Omar-Anwar-Dev/printbyfalcon
**Live URL:** https://printbyfalcon.com
**API URL:** https://api.printbyfalcon.com

---

## Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS → apps/web/
- Backend: NestJS 10, TypeScript, Prisma ORM → apps/api/
- DB: PostgreSQL 16 (Docker container: postgres-db)
- Cache: Redis 7 (Docker container: redis-cache)
- Search: Meilisearch v1.6 (Docker container: meilisearch)
- Storage: MinIO (Docker container: minio)
- Proxy: Nginx (Docker container: nginx) — SSL via Certbot
- Monorepo: Turborepo + npm workspaces
- Deployment: Hostinger VPS, Dockerized, deploy user

---

## VPS Facts
- OS: Ubuntu 24
- User for work: deploy (not root)
- Project path: /home/deploy/printbyfalcon
- Docker Compose file for prod: docker-compose.prod.yml
- SSL certs at: /etc/letsencrypt/live/printbyfalcon.com/
- Deploy script: ./scripts/deploy.sh
- Git workflow: edit on Antigravity → push to GitHub → git pull on VPS

---

## Git Branch Rules
- All work done on: develop branch
- End of each day: merge develop → main → push main → git checkout develop
- main push triggers GitHub Actions deploy

---

## Important Credentials (stored in .env on VPS only, never in GitHub)
- Admin email: admin@printbyfalcon.com
- Admin password: Admin@PrintFalcon2025!
- DB user: falcon / DB name: printbyfalcon
- .env is at /home/deploy/printbyfalcon/.env on VPS

---

## Days Completed

### ✅ Day 1 — VPS + Monorepo Bootstrap
- VPS hardened: UFW firewall (22/80/443), fail2ban, deploy user
- Docker + Nginx + Certbot installed
- Monorepo created: apps/api/, apps/web/, packages/shared/
- GitHub repo: Omar-Anwar-Dev/printbyfalcon (private)
- GitHub Secrets: VPS_HOST, VPS_USER, VPS_SSH_KEY
- CI/CD: .github/workflows/ci.yml and deploy.yml

### ✅ Day 2 — Docker Infrastructure + SSL
- docker-compose.prod.yml: all 7 containers
- All 7 containers running: postgres-db, redis-cache, meilisearch, minio, nestjs-api, nextjs-app, nginx
- https://printbyfalcon.com LIVE with valid SSL
- HTTP → HTTPS redirect working
- Security headers: HSTS, X-Frame-Options, nosniff
- scripts/deploy.sh created and working

### ✅ Day 3 — Database Schema + Auth
- Prisma schema: 20+ models migrated to PostgreSQL
- Models: User, Address, RefreshToken, Category, Brand, Product, ProductImage,
  Cart, CartItem, Wishlist, WishlistItem, Order, OrderItem, Payment,
  OrderTracking, SupportTicket, TicketReply, Coupon, Banner,
  Supplier, PurchaseOrder, POItem, StockAdjustment, SearchAnalytics, AuditLog
- Auth module complete:
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/forgot-password
  - GET /auth/profile (JWT protected)
  - POST /auth/logout
- JWT: accessToken (15min) + refreshToken (7 days), rotation on refresh
- Roles: SUPERADMIN, SALES_MANAGER, CUSTOMER_SERVICE, SUPPLIER, CUSTOMER
- Guards: JwtAuthGuard, LocalAuthGuard, RolesGuard
- Decorators: @Roles()
- Seed data: 5 categories, 5 brands, 1 admin user, 5 products

### ✅ Day 4 — Catalog API
- CategoriesModule: GET /categories, GET /categories/:slug, admin CRUD
- BrandsModule: GET /brands, GET /brands?featured=true, admin CRUD
- ProductsModule:
  - GET /products (paginated, filterable by category/brand/price/stock/rating)
  - GET /products/featured
  - GET /products/:slug (increments viewCount)
  - POST /admin/products (SUPERADMIN, SALES_MANAGER)
  - PATCH /admin/products/:id
  - POST /admin/products/:id/images (MinIO upload)
  - POST /admin/products/:id/duplicate
  - PATCH /admin/inventory/:id/stock (with StockAdjustment audit)
  - DELETE /admin/products/:id
- UploadModule: MinIO integration, auto-creates bucket on startup

### ✅ Day 6 — Cart & Wishlist
- CartModule: full guest (Redis session) + user (DB) cart
- Cart endpoints: GET/POST/PATCH/DELETE items, count, apply-coupon, remove-coupon, save-for-later
- Guest cart stored in express-session → Redis
- Cart merge on login: guest items absorbed into user DB cart
- WishlistModule: add, remove, get, move-to-cart
- OptionalJwtAuthGuard created for routes serving both guests and users
- Session middleware added to main.ts with Redis store
- SESSION_SECRET added to .env and VPS .env

### ✅ Day 7 — Orders + Paymob Payment Integration
- OrdersModule: full checkout flow with stock validation
- COD orders: created and immediately moved to PROCESSING status
- Card/Fawry: Paymob 3-step flow (auth → register order → payment key)
- Mock mode: when Paymob not configured, returns mock iFrame URL / Fawry ref
- HMAC validation on Paymob webhook callbacks
- Stock decrements on order creation, restores on payment failure
- Order tracking events created at each status change
- Admin endpoints: GET /admin/orders, PATCH /admin/orders/:id/status
- forwardRef() used to handle circular dependency between Orders ↔ Payments

### ✅ Day 8 — WhatsApp + Email Notifications
- NotificationsModule: WhatsAppService + EmailService + NotificationsService
- WhatsApp via Meta Cloud API: 3 approved templates (order_confirmation, order_status_update, payment_confirmed)
- Phone numbers auto-formatted to international format (strip leading +)
- Email via Hostinger SMTP (nodemailer): 3 HTML templates with PrintByFalcon branding
- Mock mode: when credentials absent, notifications log to console (never crash the API)
- Triggers: COD order created → order confirmation; admin status update → status change; Paymob webhook → payment confirmed
- All notification calls are fire-and-forget (don't block API response)
- NotificationsModule imported by OrdersModule, PaymentsModule, and AppModule

## Current app.module.ts imports (as of Day 8)
ConfigModule, ThrottlerModule, PrismaModule, HealthModule,
AuthModule, CategoriesModule, BrandsModule, ProductsModule,
UploadModule, SearchModule, CartModule, WishlistModule,
OrdersModule, PaymentsModule, NotificationsModule

### ✅ Day 9 — Admin Panel API (Users, Audit Log, Bulk Import, Refund)
- AdminModule: AdminIpGuard (IP whitelist from ADMIN_IP_WHITELIST env, permissive if unset) + AuditLogService
- UsersModule: GET /admin/users (search/filter), GET /admin/users/:id, PATCH /admin/users/:id (block/unblock + role change SUPERADMIN only), POST /admin/staff (create SALES_MANAGER/CUSTOMER_SERVICE/SUPPLIER accounts)
- GET /admin/audit-log: paginated, filterable by userId/entityType/action/date
- Products: POST /admin/products/bulk-import (multipart CSV, fast-csv parser, returns created/skipped/errors)
- Payments: POST /admin/orders/:id/refund (calls Paymob refund API, mock mode when Paymob not configured)
- Audit logging: UPDATE_USER and CREATE_STAFF actions logged (fire-and-forget)

## Current app.module.ts imports (as of Day 9)
ConfigModule, ThrottlerModule, PrismaModule, HealthModule,
AuthModule, CategoriesModule, BrandsModule, ProductsModule,
UploadModule, SearchModule, CartModule, WishlistModule,
OrdersModule, PaymentsModule, NotificationsModule, AdminModule, UsersModule

### ✅ Day 10 — Support Tickets, Coupons, Flash Sales, Suppliers, Banners
- SupportModule: create/get/reply to tickets, internal notes (isInternal), satisfaction rating, admin assign + status/priority updates
- CouponsModule: full admin CRUD, validate endpoint (expiry + usage + per-customer limit + min order + FREE_SHIPPING type)
- Flash sales: POST /admin/promotions/flash-sale (batch salePrice), DELETE to revert
- SuppliersModule: supplier CRUD, full PO lifecycle DRAFT→SENT→CONFIRMED→RECEIVED→CLOSED, auto stock increment on RECEIVED, performance metrics
- BannersModule: public GET /banners (active + date-filtered), admin CRUD

## Current app.module.ts imports (as of Day 10)
ConfigModule, ThrottlerModule, PrismaModule, HealthModule,
AuthModule, CategoriesModule, BrandsModule, ProductsModule,
UploadModule, SearchModule, CartModule, WishlistModule,
OrdersModule, PaymentsModule, NotificationsModule,
AdminModule, UsersModule, SupportModule, CouponsModule,
SuppliersModule, BannersModule

### ✅ Day 11 — Analytics API + Next.js Storefront Core Pages
- AnalyticsModule: GET /admin/analytics/dashboard, /sales, /daily-revenue, /revenue-by-category, /top-products, /top-searches, /export (Excel via ExcelJS)
- All analytics guarded: SUPERADMIN + SALES_MANAGER; export SUPERADMIN only
- Fixed field names: Order.totalAmount, OrderItem.unitPrice, SearchAnalytics.resultsCount
- Next.js storefront: next-intl i18n (ar default / en), RTL-aware layout
- Zustand stores: cartStore (drawer + item count), authStore (persisted JWT)
- React Query: useCart hook syncs server cart into Zustand
- Components: Navbar (sticky, mobile, language switcher, cart badge), Footer, CartDrawer
- UI: ProductCard (sale badge, add-to-cart, stock state), BannerCarousel (auto-rotate, RTL arrows)
- Pages: Homepage SSR (banners + featured products), Product list SSR (category sidebar + pagination), Product detail SSG (revalidate:3600), Cart page (client)
- Packages added: next-intl, @heroicons/react, zustand, @tanstack/react-query, clsx, tailwind-merge, exceljs

## Current app.module.ts imports (as of Day 11)
ConfigModule, ThrottlerModule, PrismaModule, HealthModule,
AuthModule, CategoriesModule, BrandsModule, ProductsModule,
UploadModule, SearchModule, CartModule, WishlistModule,
OrdersModule, PaymentsModule, NotificationsModule,
AdminModule, UsersModule, SupportModule, CouponsModule,
SuppliersModule, BannersModule, AnalyticsModule

## What's Next (Day 12+)
Day 12: Checkout flow + login/register pages + admin dashboard UI
Day 13: Security hardening
Day 14: Final testing + go-live

---

## Common Commands Reference
# VPS: check all containers
docker compose -f docker-compose.prod.yml ps

# VPS: rebuild API after code change
docker compose -f docker-compose.prod.yml up -d --build nestjs-api

# VPS: view API logs
docker compose -f docker-compose.prod.yml logs nestjs-api --tail=50

# VPS: run migration
docker compose -f docker-compose.prod.yml exec nestjs-api npx prisma migrate deploy

# Local: start infrastructure
docker compose -f docker-compose.dev.yml up -d

# Local: start API
cd apps/api && npm run dev

# Git: end of day routine
git checkout main && git merge develop && git push origin main && git checkout develop