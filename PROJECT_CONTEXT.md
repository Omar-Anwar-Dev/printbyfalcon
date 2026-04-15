# PrintByFalcon — Project Context & Handoff Document
**Last Updated:** Day 5 Complete
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

### ✅ Day 5 — Meilisearch Smart Search
- SearchModule complete:
  - GET /products/search?q= (typo-tolerant, Arabic+English)
  - GET /products/autocomplete?q=
  - POST /admin/search/sync (bulk sync all products)
  - GET /admin/search/popular (analytics)
- Arabic synonyms configured: حبر↔ink↔cartridge, طابعة↔printer, etc.
- Auto-sync: product create/update/delete syncs to Meilisearch
- Search analytics saved to DB on every query
- Typo tolerance enabled (oneTypo: 4 chars, twoTypos: 8 chars)

---

## Current app.module.ts imports (as of Day 5)
ConfigModule, ThrottlerModule, PrismaModule, HealthModule,
AuthModule, CategoriesModule, BrandsModule, ProductsModule,
UploadModule, SearchModule

---

## File Structure (key files)
apps/api/src/
├── app.module.ts
├── main.ts (port 4000, CORS, ValidationPipe)
├── health/
├── prisma/ (PrismaService — @Global)
├── auth/ (service, controller, guards, strategies, decorators, DTOs)
├── categories/ (service, controller, DTOs)
├── brands/ (service, controller, DTOs)
├── products/ (service, controller, DTOs)
├── upload/ (MinIO service)
└── search/ (Meilisearch service, controller)
apps/web/src/app/ (Next.js placeholder — "Coming Soon" page)
prisma/schema.prisma (full schema)
prisma/seed.ts (categories, brands, admin, products)
nginx/nginx.conf (HTTPS, gzip, security headers)
docker-compose.prod.yml (production, 7 containers)
docker-compose.dev.yml (local dev, infrastructure only)
scripts/deploy.sh (VPS deploy script)

---

## What's Next (Day 6+)
Day 6: Cart + Wishlist API
Day 7: Orders + Payments (Paymob integration)
Day 8: Email/SMS notifications
Day 9: Admin dashboard API
Day 10: Frontend — storefront pages
Day 11: Frontend — product pages + search UI
Day 12: Frontend — cart + checkout flow
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