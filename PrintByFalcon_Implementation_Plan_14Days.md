**🦅 PrintByFalcon**

**14-Day Execution-Ready Implementation Plan**

Hostinger KVM 2 VPS • Next.js + NestJS + PostgreSQL + Redis +
Meilisearch + MinIO

  ----------------------------------- -----------------------------------
  **Domain**                          printbyfalcon.com

  **Timeline**                        **14 Days --- Hard Cutoff**

  **Infrastructure**                  Hostinger KVM 2 VPS

  **Version**                         v1.0 --- April 2025
  ----------------------------------- -----------------------------------

**1. Project Breakdown**

**1.1 Module Map & Dependencies**

  --------- ------------------ ------------------------ -------------- -------------- --------------
  **ID**    **Module**         **Responsibility**       **Depends On** **Priority**   **Schedule**

  **M1**    **Infrastructure & Docker, VPS, CI/CD,      None           🔴 Critical    Days 1--2
            DevOps**           Nginx, SSL                                             

  **M2**    **Database &       Prisma schema,           M1             🔴 Critical    Day 2--3
            Schema**           migrations, seed                                       

  **M3**    **Auth Module**    JWT, refresh tokens,     M1, M2         🔴 Critical    Day 3--4
                               guards, RBAC                                           

  **M4**    **Product Catalog  Products, Categories,    M2, M3         🟠 High        Days 4--6
            API**              Brands CRUD                                            

  **M5**    **Meilisearch      Indexing, search,        M4             🟠 High        Day 5--6
            Integration**      autocomplete                                           

  **M6**    **File Storage     Image upload, presigned  M1, M4         🟠 High        Day 5
            (MinIO)**          URLs                                                   

  **M7**    **Cart &           Session cart, user cart, M3, M4         🟠 High        Day 6--7
            Wishlist**         Redis sync                                             

  **M8**    **Checkout &       Order creation, payment  M7             🟠 High        Day 7--9
            Paymob**           flow, webhooks                                         

  **M9**    **Order Tracking & Status flow, email/SMS   M8             🟡 Med         Day 9--10
            Notifications**                                                           

  **M10**   **Support          Ticket CRUD, agent       M3             🟡 Med         Day 10
            Tickets**          replies                                                

  **M11**   **Admin Panel      All admin endpoints,     M3--M9         🟡 Med         Day 8--11
            API**              RBAC enforcement                                       

  **M12**   **Frontend ---     Next.js pages, SSR,      M4--M10        🟡 Med         Days 4--12
            Storefront**       i18n, RTL                                              

  **M13**   **Frontend ---     Admin dashboard, data    M11            🟡 Med         Days 9--12
            Admin UI**         tables                                                 

  **M14**   **Analytics &      Sales/product/customer   M8, M11        🟡 Med         Day 11--12
            Reports**          analytics                                              

  **M15**   **QA, Hardening &  Tests, security,         All            🟡 Med         Days 13--14
            Launch**           monitoring, deploy                                     
  --------- ------------------ ------------------------ -------------- -------------- --------------

**1.2 Critical Path**

  --- --------------------------------------------------------------------
  ▶   **CRITICAL PATH:** M1 (VPS + Docker) → M2 (Schema) → M3 (Auth) → M4
      (Products) → M7 (Cart) → M8 (Checkout/Paymob) → M9 (Orders) → M12
      (Frontend) → M15 (Launch)

  --- --------------------------------------------------------------------

**1.3 Risk Register**

  --------------------- ------------ -------------------------------------
  **Risk**              **Impact**   **Mitigation**

  **Paymob sandbox      **High**     Start Paymob integration Day 7, use
  delays**                           mock webhooks locally first

  **Meilisearch Arabic  **Med**      Test Arabic tokenization Day 5, fall
  indexing**                         back to PostgreSQL FTS if needed

  **VPS RAM ceiling     **High**     Tune Docker memory limits: Next.js
  (8GB)**                            1GB, NestJS 512MB, Meili 1GB,
                                     Postgres 2GB

  **i18n scope creep**  **Med**      Freeze all UI strings by Day 11 ---
                                     no new copy after that

  **SSL cert issuance   **Low**      Pre-configure Nginx HTTP-only, issue
  fail**                             cert immediately after DNS propagates
  --------------------- ------------ -------------------------------------

**2. 14-Day Execution Plan**

  --- --------------------------------------------------------------------
  ▶   **RULE:** Each day is 8--10 focused hours. Tasks are sequential
      within the day. Deliverables must be verified before marking day
      complete.

  --- --------------------------------------------------------------------

+--------------+-------------------------------------------------------+
| **DAY 1 ---  |                                                       |
| VPS          |                                                       |
| Hardening +  |                                                       |
| Monorepo     |                                                       |
| Bootstrap +  |                                                       |
| CI/CD        |                                                       |
| Skeleton**   |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   VPS production-ready                              |
|              |                                                       |
|              | -   Monorepo initialized and pushed to GitHub         |
|              |                                                       |
|              | -   CI/CD pipeline skeleton active                    |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 1.  SSH into Hostinger VPS, create deploy user:       |
|              |     adduser deploy && usermod -aG sudo deploy &&      |
|              |     usermod -aG docker deploy                         |
|              |                                                       |
|              | 2.  Harden SSH: disable root login, disable password  |
|              |     auth, add deploy key to authorized_keys           |
|              |                                                       |
|              | 3.  Install Docker: curl -fsSL https://get.docker.com |
|              |     \| sh && apt install docker-compose-plugin -y     |
|              |                                                       |
|              | 4.  Install Nginx: apt install nginx certbot          |
|              |     python3-certbot-nginx -y                          |
|              |                                                       |
|              | 5.  Create monorepo: mkdir printbyfalcon && cd        |
|              |     printbyfalcon && git init, create apps/web        |
|              |     apps/api packages/shared structure                |
|              |                                                       |
|              | 6.  Initialize Turborepo: npx create-turbo@latest     |
|              |     \--skip-transforms --- place web and api as       |
|              |     workspaces                                        |
|              |                                                       |
|              | 7.  Create root package.json with workspaces:         |
|              |     \[\"apps/\*\", \"packages/\*\"\], add turbo.json  |
|              |     pipeline                                          |
|              |                                                       |
|              | 8.  Bootstrap NestJS API: cd apps/api && npx          |
|              |     \@nestjs/cli new . \--skip-git \--package-manager |
|              |     npm                                               |
|              |                                                       |
|              | 9.  Bootstrap Next.js frontend: cd apps/web && npx    |
|              |     create-next-app@14 . \--typescript \--tailwind    |
|              |     \--app \--skip-git                                |
|              |                                                       |
|              | 10. Create packages/shared/src/types/ with initial    |
|              |     index.ts                                          |
|              |                                                       |
|              | 11. Write docker-compose.yml (dev) with all 7         |
|              |     services, write .env.example                      |
|              |                                                       |
|              | 12. Create GitHub repo, push initial commit, create   |
|              |     branch strategy (main/develop/feature/\*)         |
|              |                                                       |
|              | 13. Write .github/workflows/ci.yml --- runs lint +    |
|              |     build on push to develop                          |
|              |                                                       |
|              | 14. Write .github/workflows/deploy.yml --- SSH deploy |
|              |     triggered on push to main (stub only today)       |
|              |                                                       |
|              | 15. Configure GitHub Secrets: VPS_HOST, VPS_USER,     |
|              |     VPS_SSH_KEY, all env secrets                      |
+--------------+-------------------------------------------------------+
| **📦         | -   **Hardened VPS with Docker installed**            |
| De           |                                                       |
| liverables** | -   **Monorepo pushed to GitHub**                     |
|              |                                                       |
|              | -   **CI pipeline running on PR**                     |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   docker \--version && docker compose version on    |
| When**       |     VPS                                               |
|              |                                                       |
|              | -   GitHub Actions CI badge green                     |
|              |                                                       |
|              | -   git log shows initial commit on main              |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 2 ---  |                                                       |
| Docker       |                                                       |
| Compose Full |                                                       |
| Stack +      |                                                       |
| Nginx +      |                                                       |
| SSL +        |                                                       |
| Domain**     |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   All 7 containers running on VPS                   |
|              |                                                       |
|              | -   Domain live with HTTPS                            |
|              |                                                       |
|              | -   Nginx reverse proxy routing traffic               |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 16. Write docker-compose.prod.yml with: nextjs-app,   |
|              |     nestjs-api, postgres-db, redis-cache,             |
|              |     meilisearch, minio, nginx                         |
|              |                                                       |
|              | 17. Define named volumes: postgres_data, redis_data,  |
|              |     meilisearch_data, minio_data                      |
|              |                                                       |
|              | 18. Configure custom bridge network: app_network ---  |
|              |     all containers on it                              |
|              |                                                       |
|              | 19. Write Nginx config:                               |
|              |     /etc/nginx/sites-available/printbyfalcon ---      |
|              |     upstream blocks for :3000 and :4000               |
|              |                                                       |
|              | 20. Point DNS A record: printbyfalcon.com → VPS IP,   |
|              |     api.printbyfalcon.com → VPS IP                    |
|              |                                                       |
|              | 21. Temp HTTP-only Nginx to pass Certbot challenge,   |
|              |     run: certbot \--nginx -d printbyfalcon.com -d     |
|              |     www.printbyfalcon.com -d api.printbyfalcon.com    |
|              |                                                       |
|              | 22. Update Nginx config with SSL blocks: listen 443   |
|              |     ssl; proxy_pass to containers; HTTP → HTTPS       |
|              |     redirect                                          |
|              |                                                       |
|              | 23. Set MinIO env: MINIO_ROOT_USER,                   |
|              |     MINIO_ROOT_PASSWORD, create bucket                |
|              |     printbyfalcon-media via mc alias                  |
|              |                                                       |
|              | 24. Set Meilisearch master key in env, test: curl     |
|              |     http://localhost:7700/health                      |
|              |                                                       |
|              | 25. Write scripts/deploy.sh: git pull, docker compose |
|              |     -f docker-compose.prod.yml up -d \--build, docker |
|              |     system prune -f                                   |
|              |                                                       |
|              | 26. Complete deploy.yml GitHub Action: ssh to VPS,    |
|              |     execute deploy.sh                                 |
|              |                                                       |
|              | 27. Add health check endpoints to NestJS: GET /health |
|              |     returns {status:\'ok\'}                           |
|              |                                                       |
|              | 28. Test full deploy: push to main → GitHub Actions → |
|              |     SSH → containers restart → HTTPS works            |
|              |                                                       |
|              | 29. Set up Certbot auto-renewal cron: 0 3 \* \* \*    |
|              |     certbot renew \--quiet                            |
+--------------+-------------------------------------------------------+
| **📦         | -   **https://printbyfalcon.com serves Next.js**      |
| De           |                                                       |
| liverables** | -   **https://api.printbyfalcon.com/health returns    |
|              |     200**                                             |
|              |                                                       |
|              | -   **All containers healthy**                        |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   curl -I https://printbyfalcon.com returns 200     |
| When**       |                                                       |
|              | -   docker compose ps shows all 7 services Up         |
|              |                                                       |
|              | -   SSL Labs score A or better                        |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 3 ---  |                                                       |
| Database     |                                                       |
| Schema       |                                                       |
| Design +     |                                                       |
| Prisma       |                                                       |
| Setup + Auth |                                                       |
| Module**     |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   Full Prisma schema committed and migrated         |
|              |                                                       |
|              | -   Auth module                                       |
|              |     (register/login/refresh/forgot-password) working  |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 30. Install Prisma in apps/api: npm install prisma    |
|              |     \@prisma/client, npx prisma init                  |
|              |                                                       |
|              | 31. Write full Prisma schema --- models: User,        |
|              |     Address, Role, Product, ProductImage,             |
|              |     ProductVariant, Category, Brand, Supplier, Cart,  |
|              |     CartItem, Wishlist, WishlistItem, Order,          |
|              |     OrderItem, OrderTracking, Payment, SupportTicket, |
|              |     TicketReply, Coupon, StockAdjustment, AuditLog,   |
|              |     SearchAnalytics                                   |
|              |                                                       |
|              | 32. Configure schema relations: User→Orders (1:many), |
|              |     Order→OrderItems (1:many), Product→Category       |
|              |     (many:1), Product→Brand (many:1),                 |
|              |     CartItem→Product, WishlistItem→Product            |
|              |                                                       |
|              | 33. Add proper indexes: @@index(\[email\]) on User,   |
|              |     @@index(\[slug\]) on Product,                     |
|              |     @@index(\[orderId\]) on OrderItem,                |
|              |     @@index(\[status\]) on Order                      |
|              |                                                       |
|              | 34. Run: npx prisma migrate dev \--name init, commit  |
|              |     migration files                                   |
|              |                                                       |
|              | 35. Write prisma/seed.ts: seed 5 categories, 8        |
|              |     brands, 1 superadmin user, 20 sample products     |
|              |                                                       |
|              | 36. Run: npx prisma db seed --- verify in psql        |
|              |                                                       |
|              | 37. Install auth dependencies: \@nestjs/jwt           |
|              |     \@nestjs/passport passport passport-jwt           |
|              |     passport-local bcrypt class-validator             |
|              |     class-transformer                                 |
|              |                                                       |
|              | 38. Create src/auth/ module: auth.module.ts,          |
|              |     auth.service.ts, auth.controller.ts,              |
|              |     jwt.strategy.ts, jwt-refresh.strategy.ts,         |
|              |     local.strategy.ts                                 |
|              |                                                       |
|              | 39. Implement register: hash password (bcrypt cost    |
|              |     12), create user, return tokens                   |
|              |                                                       |
|              | 40. Implement login: validate credentials, issue      |
|              |     accessToken (15m) + refreshToken (7d), store      |
|              |     refreshToken hash in DB                           |
|              |                                                       |
|              | 41. Implement /auth/refresh: validate refresh token,  |
|              |     rotate both tokens                                |
|              |                                                       |
|              | 42. Implement /auth/forgot-password: generate reset   |
|              |     token, send email (stub email service)            |
|              |                                                       |
|              | 43. Create RolesGuard + \@Roles() decorator ---       |
|              |     enforce SUPERADMIN, SALES_MANAGER,                |
|              |     CUSTOMER_SERVICE, CUSTOMER enum                   |
|              |                                                       |
|              | 44. Write e2e test: POST /auth/register → POST        |
|              |     /auth/login → GET /auth/profile returns user      |
+--------------+-------------------------------------------------------+
| **📦         | -   **Prisma schema with all models migrated**        |
| De           |                                                       |
| liverables** | -   **Auth endpoints tested via Postman/curl**        |
|              |                                                       |
|              | -   **Seed data in database**                         |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   npx prisma studio shows all tables with seed data |
| When**       |                                                       |
|              | -   POST /auth/login returns {accessToken,            |
|              |     refreshToken}                                     |
|              |                                                       |
|              | -   Invalid token returns 401                         |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 4 ---  |                                                       |
| Product      |                                                       |
| Catalog API  |                                                       |
| (Full        |                                                       |
| CRUD) +      |                                                       |
| Image        |                                                       |
| Upload**     |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   Products, Categories, Brands full CRUD API        |
|              |                                                       |
|              | -   MinIO image upload working                        |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 45. Generate NestJS modules: nest g module products,  |
|              |     nest g module categories, nest g module brands,   |
|              |     nest g module upload                              |
|              |                                                       |
|              | 46. Implement CategoryService:                        |
|              |     create/findAll/findOne/update/remove, include     |
|              |     parent/children tree structure for subcategories  |
|              |                                                       |
|              | 47. Implement BrandService: CRUD + associate with     |
|              |     categories                                        |
|              |                                                       |
|              | 48. Implement ProductService: create with bilingual   |
|              |     fields (nameAr, nameEn, descriptionAr,            |
|              |     descriptionEn), slug auto-generation, SKU,        |
|              |     barcode, price, salePrice, stock                  |
|              |                                                       |
|              | 49. ProductService: findAll with filters (categoryId, |
|              |     brandId, minPrice, maxPrice, inStock,             |
|              |     hasDiscount), sorting, pagination (cursor-based   |
|              |     for performance)                                  |
|              |                                                       |
|              | 50. ProductService: getCompatibleProducts --- link    |
|              |     cartridges to printer model strings stored in     |
|              |     compatibility JSON field                          |
|              |                                                       |
|              | 51. Implement UploadService: connect to MinIO using   |
|              |     minio npm client, upload buffer, return public    |
|              |     URL                                               |
|              |                                                       |
|              | 52. ProductController: POST /products/:id/images ---  |
|              |     accept multipart, upload to MinIO bucket, store   |
|              |     URL in ProductImage table                         |
|              |                                                       |
|              | 53. Add DTOs with class-validator: CreateProductDto,  |
|              |     UpdateProductDto, ProductFilterDto                |
|              |                                                       |
|              | 54. Write Prisma full-text search on nameAr, nameEn,  |
|              |     description using mode: \'insensitive\' (temp,    |
|              |     until Meilisearch)                                |
|              |                                                       |
|              | 55. Admin product endpoints under /admin/products --- |
|              |     guard with \@Roles(SUPERADMIN, SALES_MANAGER)     |
|              |                                                       |
|              | 56. Public product endpoints: GET /products, GET      |
|              |     /products/:slug, GET /categories, GET /brands     |
|              |                                                       |
|              | 57. Configure Multer: max 5 files, 5MB each, accept   |
|              |     image/jpeg image/png image/webp only              |
|              |                                                       |
|              | 58. Add rate limiting: \@nestjs/throttler --- 100     |
|              |     req/min on public endpoints, 20 req/min on auth   |
|              |     endpoints                                         |
+--------------+-------------------------------------------------------+
| **📦         | -   **All product CRUD endpoints functional**         |
| De           |                                                       |
| liverables** | -   **Image upload to MinIO working**                 |
|              |                                                       |
|              | -   **Pagination on product list**                    |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   POST /admin/products creates product with slug    |
| When**       |                                                       |
|              | -   GET /products?categoryId=X returns filtered list  |
|              |                                                       |
|              | -   Image URL accessible via MinIO public URL         |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 5 ---  |                                                       |
| Meilisearch  |                                                       |
| I            |                                                       |
| ntegration + |                                                       |
| Search API** |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   Products indexed in Meilisearch                   |
|              |                                                       |
|              | -   Search with autocomplete, typo tolerance, Arabic  |
|              |     support                                           |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 59. Install: npm install meilisearch in apps/api      |
|              |                                                       |
|              | 60. Create src/search/search.module.ts,               |
|              |     search.service.ts --- initialize Meilisearch      |
|              |     client with MEILI_HOST + MEILI_MASTER_KEY         |
|              |                                                       |
|              | 61. Configure products index settings:                |
|              |     searchableAttributes: \[nameAr, nameEn,           |
|              |     brand.name, category.name, sku\],                 |
|              |     filterableAttributes: \[categoryId, brandId,      |
|              |     price, inStock, hasDiscount, rating\],            |
|              |     sortableAttributes: \[price, createdAt,           |
|              |     soldCount, rating\]                               |
|              |                                                       |
|              | 62. Set typoTolerance: {enabled:true,                 |
|              |     minWordSizeForTypos:{oneTypo:4, twoTypos:8}}      |
|              |                                                       |
|              | 63. Set synonyms: {حبر:\[\'ink\',\'cartridge\'\],     |
|              |     طابعة:\[\'printer\',\'printers\'\]}               |
|              |                                                       |
|              | 64. Create SearchSyncService: on product              |
|              |     create/update/delete, sync to Meilisearch index   |
|              |                                                       |
|              | 65. Write bulk indexing script:                       |
|              |     scripts/sync-search.ts --- fetches all products   |
|              |     from DB, indexes in batches of 500                |
|              |                                                       |
|              | 66. Implement GET                                     |
|              |     /products                                         |
|              | /search?q=&category=&brand=&minPrice=&maxPrice=&sort= |
|              |     --- routes to Meilisearch                         |
|              |                                                       |
|              | 67. Implement GET /products/autocomplete?q= ---       |
|              |     returns top 8 suggestions from Meilisearch,       |
|              |     cached in Redis for 60s                           |
|              |                                                       |
|              | 68. Store search queries in SearchAnalytics table for |
|              |     admin reporting                                   |
|              |                                                       |
|              | 69. Test Arabic search: query \'حبر HP\' returns HP   |
|              |     ink products                                      |
|              |                                                       |
|              | 70. Test typo tolerance: query \'Lserjet\' returns    |
|              |     LaserJet products                                 |
|              |                                                       |
|              | 71. Add Meilisearch health check to /health endpoint  |
|              |                                                       |
|              | 72. Run bulk sync on seeded data, verify all 20 seed  |
|              |     products appear in search results                 |
+--------------+-------------------------------------------------------+
| **📦         | -   **Meilisearch index populated**                   |
| De           |                                                       |
| liverables** | -   **GET /products/search working**                  |
|              |                                                       |
|              | -   **Autocomplete returning suggestions**            |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   GET /products/search?q=hp returns HP products in  |
| When**       |     \<100ms                                           |
|              |                                                       |
|              | -   Typo search \'Epsen\' returns Epson products      |
|              |                                                       |
|              | -   Arabic query returns correct results              |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 6 ---  |                                                       |
| Cart +       |                                                       |
| Wishlist     |                                                       |
| Modules**    |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   Guest cart (Redis session) + user cart (DB)       |
|              |                                                       |
|              | -   Wishlist CRUD for authenticated users             |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 73. Install: npm install \@nestjs/cache-manager       |
|              |     cache-manager ioredis connect-redis               |
|              |     express-session                                   |
|              |                                                       |
|              | 74. Configure Redis session store: session secret     |
|              |     from env, 7-day TTL for logged-in, 24h for guest  |
|              |                                                       |
|              | 75. Create CartService: getCart (merge guest cart on  |
|              |     login), addItem, updateQuantity, removeItem,      |
|              |     clearCart                                         |
|              |                                                       |
|              | 76. Cart logic: if user logged in → store in          |
|              |     Cart/CartItem table; if guest → store in Redis    |
|              |     key cart:{sessionId} as JSON                      |
|              |                                                       |
|              | 77. On user login: merge Redis cart into DB cart      |
|              |     (additive, respect stock limits)                  |
|              |                                                       |
|              | 78. CartService.getCartWithPrices: enrich items with  |
|              |     current product prices, detect price changes      |
|              |     since cart add                                    |
|              |                                                       |
|              | 79. CartService.validateStock: check current          |
|              |     inventory before checkout --- throw if any item   |
|              |     exceeds stock                                     |
|              |                                                       |
|              | 80. Apply coupon to cart: POST /cart/apply-coupon --- |
|              |     validate coupon code, calculate discount, store   |
|              |     in cart state                                     |
|              |                                                       |
|              | 81. Implement WishlistService: addToWishlist,         |
|              |     removeFromWishlist, getWishlist, moveToCart       |
|              |                                                       |
|              | 82. Wishlist: check if product already wishlisted,    |
|              |     return isWishlisted flag on product endpoints     |
|              |                                                       |
|              | 83. POST /cart/save-for-later/:itemId --- move cart   |
|              |     item to wishlist                                  |
|              |                                                       |
|              | 84. Guard wishlist endpoints with JwtAuthGuard        |
|              |                                                       |
|              | 85. Cart badge count: GET /cart/count --- returns     |
|              |     integer (fast, Redis-first lookup)                |
|              |                                                       |
|              | 86. Write unit tests for cart merge logic and coupon  |
|              |     application                                       |
+--------------+-------------------------------------------------------+
| **📦         | -   **Guest cart stored in Redis**                    |
| De           |                                                       |
| liverables** | -   **Logged-in cart persisted in DB**                |
|              |                                                       |
|              | -   **Cart/wishlist merge on login**                  |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   Add item as guest, login, cart persists           |
| When**       |                                                       |
|              | -   Apply coupon code reduces total correctly         |
|              |                                                       |
|              | -   Wishlist add/remove works for authenticated user  |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 7 ---  |                                                       |
| Checkout     |                                                       |
| Flow +       |                                                       |
| Paymob       |                                                       |
| Integration  |                                                       |
| (Card +      |                                                       |
| Fawry +      |                                                       |
| COD)**       |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   Full checkout flow working end-to-end             |
|              |                                                       |
|              | -   Paymob card and Fawry payment channels integrated |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 87. Install: npm install axios (for Paymob API        |
|              |     calls), create src/payments/ module               |
|              |                                                       |
|              | 88. Implement OrderService.createOrder: validate      |
|              |     cart, calculate totals (subtotal + shipping +     |
|              |     VAT), create Order + OrderItems in DB, decrement  |
|              |     stock, clear cart                                 |
|              |                                                       |
|              | 89. Order statuses enum: PENDING_PAYMENT,             |
|              |     PAYMENT_CONFIRMED, PROCESSING, SHIPPED,           |
|              |     OUT_FOR_DELIVERY, DELIVERED, CANCELLED, REFUNDED  |
|              |                                                       |
|              | 90. Paymob flow (Card): Step 1 --- POST               |
|              |     /api/auth/tokens (get Paymob token), Step 2 ---   |
|              |     POST /api/ecommerce/orders (register order), Step |
|              |     3 --- POST /api/acceptance/payment_keys (get      |
|              |     payment key), return iFrame URL to frontend       |
|              |                                                       |
|              | 91. Paymob flow (Fawry): same 3 steps, use Fawry      |
|              |     integration ID --- returns ref_number for         |
|              |     customer                                          |
|              |                                                       |
|              | 92. COD flow: create order directly with status       |
|              |     PENDING_DELIVERY, no Paymob call needed           |
|              |                                                       |
|              | 93. Paymob webhook: POST /payments/callback ---       |
|              |     validate HMAC signature, update                   |
|              |     Order.paymentStatus, update Order.status to       |
|              |     PAYMENT_CONFIRMED                                 |
|              |                                                       |
|              | 94. HMAC validation: crypto.createHmac(\'sha512\',    |
|              |     PAYMOB_HM                                         |
|              | AC_SECRET).update(concatenatedString).digest(\'hex\') |
|              |                                                       |
|              | 95. POST /orders/checkout --- body: {addressId,       |
|              |     shippingMethod, paymentMethod, couponCode}        |
|              |                                                       |
|              | 96. GET /orders --- user\'s order history, paginated  |
|              |                                                       |
|              | 97. GET /orders/:id --- full order detail with items, |
|              |     tracking, payment                                 |
|              |                                                       |
|              | 98. Admin: PATCH /admin/orders/:id/status --- update  |
|              |     status, validate state machine transitions        |
|              |                                                       |
|              | 99. Stock rollback on payment failure: listen for     |
|              |     Paymob failed callback, restore stock quantities  |
|              |                                                       |
|              | 100. Write OrderService.generateInvoiceNumber: format |
|              |      FLN-YYYYMMDD-XXXX                                |
+--------------+-------------------------------------------------------+
| **📦         | -   **Full checkout creates order in DB**             |
| De           |                                                       |
| liverables** | -   **Paymob card payment iFrame URL returned**       |
|              |                                                       |
|              | -   **Fawry reference number returned**               |
|              |                                                       |
|              | -   **COD order created directly**                    |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   POST /orders/checkout with card method returns    |
| When**       |     {iframeUrl}                                       |
|              |                                                       |
|              | -   Paymob webhook updates order status               |
|              |                                                       |
|              | -   Order appears in GET /orders                      |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 8 ---  |                                                       |
| Order        |                                                       |
| Not          |                                                       |
| ifications + |                                                       |
| Tracking +   |                                                       |
| Email/SMS**  |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   Email/SMS notifications on order events           |
|              |                                                       |
|              | -   Order tracking timeline working                   |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 101. Install: npm install nodemailer                  |
|              |      \@types/nodemailer handlebars                    |
|              |                                                       |
|              | 102. Create EmailService: configure SMTP (SendGrid or |
|              |      Hostinger SMTP), compile Handlebars templates    |
|              |                                                       |
|              | 103. Email templates (HTML): order-confirmation.hbs,  |
|              |      payment-confirmed.hbs, order-shipped.hbs,        |
|              |      order-delivered.hbs, password-reset.hbs          |
|              |                                                       |
|              | 104. Create SmsService: integrate Vonage (preferred   |
|              |      for Egypt) --- npm install \@vonage/server-sdk   |
|              |                                                       |
|              | 105. SMS templates (short): \'طلبك #FLN-001 تم        |
|              |      استلامه. شكراً من PrintByFalcon\', order shipped  |
|              |      with tracking                                    |
|              |                                                       |
|              | 106. OrderEventsService: on order status change,      |
|              |      trigger correct email + SMS asynchronously (use  |
|              |      Bull queue to not block response)                |
|              |                                                       |
|              | 107. Install Bull queue: npm install \@nestjs/bull    |
|              |      bull, configure with Redis                       |
|              |                                                       |
|              | 108. Queues: email.queue, sms.queue --- retry 3 times |
|              |      on failure, exponential backoff                  |
|              |                                                       |
|              | 109. Create OrderTrackingService: addTrackingEvent    |
|              |      (orderId, status, note, timestamp), getTimeline  |
|              |      (returns sorted events array)                    |
|              |                                                       |
|              | 110. POST /admin/orders/:id/tracking --- add courier  |
|              |      name + tracking number, triggers \'Shipped\'     |
|              |      notification                                     |
|              |                                                       |
|              | 111. GET /orders/:id/tracking --- returns tracking    |
|              |      timeline array for My Orders page                |
|              |                                                       |
|              | 112. Add courier tracking URL: map known courier      |
|              |      names (Aramex, Egypt Post, DHL) to their         |
|              |      tracking URL patterns                            |
|              |                                                       |
|              | 113. Test full flow: checkout → PAYMENT_CONFIRMED     |
|              |      webhook → email sent → SMS sent → confirm in     |
|              |      logs                                             |
|              |                                                       |
|              | 114. Add Bull board for queue monitoring:             |
|              |      \@bull-board/nestjs (admin-only route            |
|              |      /admin/queues)                                   |
+--------------+-------------------------------------------------------+
| **📦         | -   **Order confirmation email delivered**            |
| De           |                                                       |
| liverables** | -   **SMS notification sent on status change**        |
|              |                                                       |
|              | -   **Tracking timeline stored and queryable**        |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   Create test order, verify email in inbox          |
| When**       |                                                       |
|              | -   Order status change triggers SMS                  |
|              |                                                       |
|              | -   GET /orders/:id/tracking returns array of events  |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 9 ---  |                                                       |
| Admin Panel  |                                                       |
| API --- Core |                                                       |
| (Products,   |                                                       |
| Orders,      |                                                       |
| Users)**     |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   All admin CRUD endpoints built and guarded        |
|              |                                                       |
|              | -   RBAC fully enforced on all admin routes           |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 115. Create AdminModule with AdminGuard --- IP        |
|              |      whitelist check from env:                        |
|              |      ADMIN_IP_WHITELIST=x.x.x.x,y.y.y.y               |
|              |                                                       |
|              | 116. Admin Products: GET/POST/PATCH/DELETE            |
|              |      /admin/products --- include draft/archived       |
|              |      status management                                |
|              |                                                       |
|              | 117. Admin Products: POST /admin/products/bulk-import |
|              |      --- accept CSV, parse with fast-csv, batch       |
|              |      create                                           |
|              |                                                       |
|              | 118. Admin Products: POST                             |
|              |      /admin/products/:id/duplicate --- clone product  |
|              |      with \'Copy of\' prefix                          |
|              |                                                       |
|              | 119. Admin Categories: full CRUD + drag-order (PATCH  |
|              |      /admin/categories/order --- accepts sorted ID    |
|              |      array)                                           |
|              |                                                       |
|              | 120. Admin Brands: full CRUD + featured flag toggle   |
|              |                                                       |
|              | 121. Admin Inventory: PATCH /admin/products/:id/stock |
|              |      --- adjust stock with reason, log to             |
|              |      StockAdjustment                                  |
|              |                                                       |
|              | 122. Admin Orders: GET /admin/orders --- filters:     |
|              |      status, dateFrom, dateTo, paymentMethod,         |
|              |      customerId --- paginated with cursor             |
|              |                                                       |
|              | 123. Admin Orders: PATCH /admin/orders/:id --- update |
|              |      status, add tracking, assign agent               |
|              |                                                       |
|              | 124. Admin Orders: POST /admin/orders/:id/refund ---  |
|              |      trigger Paymob refund API call                   |
|              |                                                       |
|              | 125. Admin Users: GET /admin/users --- search by      |
|              |      name/email/phone, filter by role                 |
|              |                                                       |
|              | 126. Admin Users: PATCH /admin/users/:id ---          |
|              |      block/unblock, change role (SUPERADMIN only)     |
|              |                                                       |
|              | 127. Admin Staff: POST /admin/staff --- create staff  |
|              |      account with role assignment                     |
|              |                                                       |
|              | 128. Audit logging: AuditLogService.log(userId,       |
|              |      action, entityType, entityId, diff) --- call on  |
|              |      all mutations                                    |
|              |                                                       |
|              | 129. Implement GET /admin/audit-log --- paginated,    |
|              |      filterable by user/action/date                   |
+--------------+-------------------------------------------------------+
| **📦         | -   **All admin CRUD endpoints functional**           |
| De           |                                                       |
| liverables** | -   **RBAC enforced (wrong role returns 403)**        |
|              |                                                       |
|              | -   **Audit log recording all admin actions**         |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   Sales Manager cannot access /admin/users (403)    |
| When**       |                                                       |
|              | -   PATCH /admin/orders/:id updates status and logs   |
|              |     audit entry                                       |
|              |                                                       |
|              | -   Bulk CSV import creates products                  |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 10 --- |                                                       |
| Support      |                                                       |
| Tickets +    |                                                       |
| Promotions + |                                                       |
| Supplier     |                                                       |
| Module**     |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   Support ticket system end-to-end                  |
|              |                                                       |
|              | -   Coupon/promo engine                               |
|              |                                                       |
|              | -   Supplier management                               |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 130. SupportTicketService: create ticket (category,   |
|              |      priority, message), getTicket, addReply,         |
|              |      closeTicket, rateSatisfaction                    |
|              |                                                       |
|              | 131. Ticket categories enum: PRODUCT_INQUIRY,         |
|              |      ORDER_ISSUE, TECHNICAL_SUPPORT, RETURNS_REFUNDS  |
|              |                                                       |
|              | 132. Ticket priority: LOW, MEDIUM, HIGH, URGENT ---   |
|              |      agents can update priority                       |
|              |                                                       |
|              | 133. Internal notes on tickets: TicketReply with      |
|              |      isInternal:true --- never returned to customer   |
|              |                                                       |
|              | 134. POST /support/tickets, GET /support/tickets, GET |
|              |      /support/tickets/:id, POST                       |
|              |      /support/tickets/:id/reply                       |
|              |                                                       |
|              | 135. Admin: GET /admin/support/tickets --- filter by  |
|              |      status/priority/agent, bulk assign               |
|              |                                                       |
|              | 136. Admin: POST /admin/support/tickets/:id/assign    |
|              |      --- assign to agent by userId                    |
|              |                                                       |
|              | 137. CouponService: create coupon (code, type:        |
|              |      PERCENT\|FIXED\|FREE_SHIPPING, value, minOrder,  |
|              |      maxUses, expiresAt, perCustomerLimit)            |
|              |                                                       |
|              | 138. CouponService.validate: check expiry, usage      |
|              |      count, per-customer usage, minimum order ---     |
|              |      return discount amount                           |
|              |                                                       |
|              | 139. Flash sale: POST /admin/promotions/flash-sale    |
|              |      --- set salePrice + saleEndDate on products,     |
|              |      cron job to reset at end                         |
|              |                                                       |
|              | 140. SupplierService: CRUD supplier profiles,         |
|              |      associate products.supplierId                    |
|              |                                                       |
|              | 141. PurchaseOrderService: createPO, updatePOStatus   |
|              |      (DRAFT→SENT→CONFIRMED→RECEIVED→CLOSED), track    |
|              |      items received                                   |
|              |                                                       |
|              | 142. GET /admin/suppliers/:id/performance --- avg     |
|              |      delivery days, fulfillment rate calculated from  |
|              |      PO history                                       |
|              |                                                       |
|              | 143. Homepage banners: CRUD /admin/banners --- image  |
|              |      URL, link, display order, active dates           |
+--------------+-------------------------------------------------------+
| **📦         | -   **Customer can create and track support tickets** |
| De           |                                                       |
| liverables** | -   **Coupon codes apply at checkout**                |
|              |                                                       |
|              | -   **Suppliers and POs manageable in admin**         |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   POST /support/tickets creates ticket              |
| When**       |                                                       |
|              | -   Apply coupon SAVE10 gives 10% off                 |
|              |                                                       |
|              | -   PO status flow transitions correctly              |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 11 --- |                                                       |
| Analytics +  |                                                       |
| Reports +    |                                                       |
| Next.js      |                                                       |
| Storefront   |                                                       |
| (Core        |                                                       |
| Pages)**     |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   Analytics API complete                            |
|              |                                                       |
|              | -   Next.js: home, product list, product detail pages |
|              |     SSR                                               |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 144. AnalyticsService.getSalesSummary: total revenue, |
|              |      order count, avg order value for date range ---  |
|              |      raw SQL for performance                          |
|              |                                                       |
|              | 145. AnalyticsService.getRevenueByCategory: GROUP BY  |
|              |      categoryId, JOIN categories                      |
|              |                                                       |
|              | 146. AnalyticsService.getTopProducts: ORDER BY        |
|              |      soldCount DESC, LIMIT 10                         |
|              |                                                       |
|              | 147. AnalyticsService.getTopSearchTerms: SELECT       |
|              |      query, COUNT(\*) FROM SearchAnalytics GROUP BY   |
|              |      query LIMIT 20                                   |
|              |                                                       |
|              | 148. AnalyticsService.getAbandonedCartRate: carts     |
|              |      older than 24h with no order / total carts       |
|              |                                                       |
|              | 149. Export service: generate Excel with ExcelJS ---  |
|              |      npm install exceljs --- create workbooks for     |
|              |      each report type                                 |
|              |                                                       |
|              | 150. Next.js: configure next-i18next for ar/en, set   |
|              |      defaultLocale:\'ar\', add /public/locales/ar/    |
|              |      and /en/ JSON files                              |
|              |                                                       |
|              | 151. Next.js layout: RootLayout with Navbar           |
|              |      (RTL-aware), Footer, CartDrawer (Zustand),       |
|              |      global providers                                 |
|              |                                                       |
|              | 152. Configure Tailwind with tailwindcss-rtl plugin,  |
|              |      set dir attribute on \<html\> based on locale    |
|              |                                                       |
|              | 153. Homepage (app/\[locale\]/page.tsx): SSR ---      |
|              |      fetch featured products, banners from API, hero  |
|              |      section, product grid                            |
|              |                                                       |
|              | 154. Product list page                                |
|              |      (app/\[locale\]/products/page.tsx): SSR with     |
|              |      searchParams for filters --- fetch from          |
|              |      /products API                                    |
|              |                                                       |
|              | 155. Product detail page                              |
|              |      (app/\[locale\]/products/\[slug\]/page.tsx): SSG |
|              |      with revalidate:3600 --- generateMetadata for    |
|              |      SEO                                              |
|              |                                                       |
|              | 156. Product detail: image gallery with zoom          |
|              |      (react-medium-image-zoom), add to cart button,   |
|              |      compatible products section                      |
|              |                                                       |
|              | 157. Setup Zustand: cartStore (items, total, addItem, |
|              |      removeItem, updateQty), authStore (user, tokens) |
|              |                                                       |
|              | 158. Setup React Query: configure QueryClient, wrap   |
|              |      app, create hooks: useProducts, useProduct,      |
|              |      useCart                                          |
+--------------+-------------------------------------------------------+
| **📦         | -   **Analytics API returning real data**             |
| De           |                                                       |
| liverables** | -   **Homepage SSR live**                             |
|              |                                                       |
|              | -   **Product list and detail pages working with real |
|              |     data**                                            |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   GET /admin/analytics/sales returns revenue data   |
| When**       |                                                       |
|              | -   Homepage renders product data from API            |
|              |                                                       |
|              | -   Product slug page has correct meta title for SEO  |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 12 --- |                                                       |
| Frontend --- |                                                       |
| Full         |                                                       |
| Storefront + |                                                       |
| Admin UI**   |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   All customer-facing pages complete                |
|              |                                                       |
|              | -   Admin dashboard functional                        |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 159. Search page: debounced input → Meilisearch via   |
|              |      API, filter sidebar (category, brand, price      |
|              |      slider), URL-persisted filters                   |
|              |                                                       |
|              | 160. Autocomplete: Combobox component, show on 2+     |
|              |      chars, 300ms debounce, keyboard navigation       |
|              |                                                       |
|              | 161. Cart page: item list with quantity stepper,      |
|              |      remove, coupon input, subtotal/VAT/shipping      |
|              |      breakdown, checkout button                       |
|              |                                                       |
|              | 162. Checkout: multi-step wizard --- Step1:Address,   |
|              |      Step2:Shipping, Step3:Payment,                   |
|              |      Step4:Review+Place Order                         |
|              |                                                       |
|              | 163. Payment step: card → embed Paymob iFrame; Fawry  |
|              |      → show ref number + countdown; COD → place order |
|              |      directly                                         |
|              |                                                       |
|              | 164. My Orders page: order cards with status badge,   |
|              |      timeline accordion on expand, re-order button    |
|              |                                                       |
|              | 165. User profile: edit info form, address CRUD       |
|              |      (add/edit/delete/set-default)                    |
|              |                                                       |
|              | 166. Wishlist page: product cards with add-to-cart,   |
|              |      remove button                                    |
|              |                                                       |
|              | 167. Support tickets page: create ticket form, ticket |
|              |      list with status, ticket detail with reply       |
|              |      thread                                           |
|              |                                                       |
|              | 168. Admin UI: use Next.js app router /admin/ segment |
|              |      with AdminLayout --- sidebar nav, protected by   |
|              |      admin JWT check                                  |
|              |                                                       |
|              | 169. Admin Dashboard: KPI cards (revenue, orders,     |
|              |      customers, low stock), revenue chart (recharts   |
|              |      LineChart), recent orders table                  |
|              |                                                       |
|              | 170. Admin Products page: DataTable with search,      |
|              |      filters, inline status toggle, edit/delete       |
|              |      actions, import CSV button                       |
|              |                                                       |
|              | 171. Admin Orders page: filterable table, status      |
|              |      badge, click to order detail with status update  |
|              |      dropdown                                         |
|              |                                                       |
|              | 172. Admin Users page: customer list, profile drawer, |
|              |      block/unblock action                             |
|              |                                                       |
|              | 173. Schema.org JSON-LD: add Product structured data  |
|              |      to product detail pages, BreadcrumbList to all   |
|              |      pages                                            |
+--------------+-------------------------------------------------------+
| **📦         | -   **Full customer journey navigable end-to-end**    |
| De           |                                                       |
| liverables** | -   **Admin can manage products/orders from UI**      |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   Guest can browse→search→view product→add to       |
| When**       |     cart→checkout in one session                      |
|              |                                                       |
|              | -   Admin changes order status, customer sees update  |
|              |                                                       |
|              | -   PageSpeed mobile score \> 70                      |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 13 --- |                                                       |
| Testing +    |                                                       |
| Security     |                                                       |
| Hardening**  |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   Critical paths E2E tested                         |
|              |                                                       |
|              | -   Security hardening applied                        |
|              |                                                       |
|              | -   Performance validated                             |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 174. Install Playwright: npm install                  |
|              |      \@playwright/test, configure for                 |
|              |      https://printbyfalcon.com staging                |
|              |                                                       |
|              | 175. E2E test: guest browse → search → product detail |
|              |      → add to cart → register → checkout flow         |
|              |                                                       |
|              | 176. E2E test: admin login → create product → product |
|              |      appears in search                                |
|              |                                                       |
|              | 177. E2E test: order placed → webhook fires → status  |
|              |      updated → email sent                             |
|              |                                                       |
|              | 178. Unit tests (Jest): CartService.mergeCarts,       |
|              |      CouponService.validate,                          |
|              |      OrderService.calculateTotal, HMAC validation     |
|              |                                                       |
|              | 179. Security: add helmet middleware --- npm install  |
|              |      helmet, configure CSP headers                    |
|              |                                                       |
|              | 180. Security: configure CORS in NestJS --- allow     |
|              |      only https://printbyfalcon.com and               |
|              |      https://www.printbyfalcon.com                    |
|              |                                                       |
|              | 181. Security: add express-rate-limit on /auth routes |
|              |      --- 5 requests/15min, lockout after 5 failed     |
|              |      logins                                           |
|              |                                                       |
|              | 182. Security: validate Paymob webhook HMAC on every  |
|              |      callback --- reject if signature mismatch        |
|              |                                                       |
|              | 183. Security: admin IP whitelist middleware --- read |
|              |      from env, return 403 for non-whitelisted IPs     |
|              |                                                       |
|              | 184. Run OWASP ZAP baseline scan on staging, fix any  |
|              |      HIGH findings                                    |
|              |                                                       |
|              | 185. Performance: enable Next.js output:              |
|              |      \'standalone\', configure next.config.js image   |
|              |      domains for MinIO                                |
|              |                                                       |
|              | 186. Performance: add Redis caching to hot endpoints  |
|              |      --- GET /products/featured (TTL 5min), GET       |
|              |      /categories (TTL 1h)                             |
|              |                                                       |
|              | 187. Nginx tuning: gzip on, gzip_types text/html      |
|              |      application/json, keepalive_timeout 65,          |
|              |      worker_processes auto                            |
|              |                                                       |
|              | 188. Set up Sentry: npm install \@sentry/nextjs       |
|              |      \@sentry/node --- add to both apps, configure    |
|              |      SENTRY_DSN env                                   |
|              |                                                       |
|              | 189. Set up Uptime Kuma on VPS port 3001: monitor     |
|              |      https://printbyfalcon.com every 60s, alert on    |
|              |      Telegram                                         |
+--------------+-------------------------------------------------------+
| **📦         | -   **Playwright E2E suite passing**                  |
| De           |                                                       |
| liverables** | -   **Helmet + rate limiting active**                 |
|              |                                                       |
|              | -   **Sentry capturing errors**                       |
|              |                                                       |
|              | -   **Uptime monitor live**                           |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   npx playwright test --- all tests green           |
| When**       |                                                       |
|              | -   curl /auth/login 6 times → 6th returns 429        |
|              |                                                       |
|              | -   Sentry dashboard shows no new errors after smoke  |
|              |     test                                              |
+--------------+-------------------------------------------------------+

+--------------+-------------------------------------------------------+
| **DAY 14 --- |                                                       |
| Production   |                                                       |
| Deploy +     |                                                       |
| Monitoring + |                                                       |
| Go-Live**    |                                                       |
+--------------+-------------------------------------------------------+
| **🎯 Goals** | -   Production fully deployed                         |
|              |                                                       |
|              | -   Backups configured                                |
|              |                                                       |
|              | -   Smoke tested and live                             |
+--------------+-------------------------------------------------------+
| **⚙ Tasks**  | 190. Final environment audit: check all .env.prod     |
|              |      values --- no localhost, no dev keys,            |
|              |      PAYMOB_LIVE=true                                 |
|              |                                                       |
|              | 191. Run Paymob live payment test with real card      |
|              |      (small amount), verify webhook receipt           |
|              |                                                       |
|              | 192. Deploy to production: git push main → GitHub     |
|              |      Actions → deploy.sh → docker compose up -d       |
|              |      \--build                                         |
|              |                                                       |
|              | 193. Post-deploy: docker compose ps --- all 7         |
|              |      services Up. Check logs: docker compose logs     |
|              |      \--tail=50 each service                          |
|              |                                                       |
|              | 194. Run Prisma migrations on production DB: docker   |
|              |      compose exec nestjs-api npx prisma migrate       |
|              |      deploy                                           |
|              |                                                       |
|              | 195. Run search sync: docker compose exec nestjs-api  |
|              |      npx ts-node scripts/sync-search.ts               |
|              |                                                       |
|              | 196. Configure automated PostgreSQL backup:           |
|              |      scripts/backup.sh --- pg_dump to                 |
|              |      /backups/YYYY-MM-DD.sql.gz, sync to external S3  |
|              |      or Hostinger object storage                      |
|              |                                                       |
|              | 197. Add cron: 2 0 \* \* \*                           |
|              |      /home/deploy/printbyfalcon/scripts/backup.sh     |
|              |      \>\> /var/log/backup.log 2\>&1                   |
|              |                                                       |
|              | 198. Smoke test checklist: browse products, search,   |
|              |      add to cart, checkout (COD test order), admin    |
|              |      login, create product, view analytics            |
|              |                                                       |
|              | 199. Submit sitemap to Google Search Console:         |
|              |      https://printbyfalcon.com/sitemap.xml            |
|              |                                                       |
|              | 200. Configure robots.txt: allow /products,           |
|              |      /categories, /brands; disallow /admin,           |
|              |      /checkout, /api                                  |
|              |                                                       |
|              | 201. Set up log rotation:                             |
|              |      /etc/logrotate.d/docker-logs --- daily, keep 7   |
|              |      days                                             |
|              |                                                       |
|              | 202. Document runbook: deploy.md with rollback        |
|              |      procedure (git revert + redeploy), DB restore    |
|              |      steps                                            |
|              |                                                       |
|              | 203. Final DNS check: both printbyfalcon.com and www  |
|              |      redirect to HTTPS, api subdomain resolves        |
|              |                                                       |
|              | 204. Announce go-live --- confirm Uptime Kuma shows   |
|              |      green, Sentry has 0 unresolved issues            |
+--------------+-------------------------------------------------------+
| **📦         | -   **Production site live at                         |
| De           |     https://printbyfalcon.com**                       |
| liverables** |                                                       |
|              | -   **Backups running**                               |
|              |                                                       |
|              | -   **Monitoring green**                              |
|              |                                                       |
|              | -   **Runbook documented**                            |
+--------------+-------------------------------------------------------+
| **✅ Done    | -   Full smoke test checklist passed                  |
| When**       |                                                       |
|              | -   Live Paymob payment succeeds                      |
|              |                                                       |
|              | -   Daily backup cron runs at 00:02                   |
|              |                                                       |
|              | -   Uptime Kuma shows UP                              |
+--------------+-------------------------------------------------------+

**3. Development Strategy**

**3.1 Monorepo Structure**

  --------------------------- -------------------------------------------
  **Path**                    **Purpose**

  **printbyfalcon/**          Root --- turbo.json, package.json,
                              .env.example, docker-compose\*.yml

  **apps/api/**               NestJS backend --- src/, prisma/,
                              Dockerfile

  **apps/web/**               Next.js frontend --- app/, public/,
                              Dockerfile

  **packages/shared/**        Shared TypeScript types, DTOs, constants
                              (no runtime deps)

  **nginx/**                  nginx.conf, SSL certs (Certbot-managed)

  **scripts/**                deploy.sh, backup.sh, sync-search.ts, seed
                              helpers

  **.github/workflows/**      ci.yml (lint+build on PR), deploy.yml (SSH
                              deploy on main)

  **apps/api/src/**           modules/, common/, config/,
                              prisma.service.ts, app.module.ts

  **apps/api/prisma/**        schema.prisma, migrations/, seed.ts

  **apps/web/app/**           \[locale\]/ (route group), admin/
                              (segment), components/, lib/, store/
  --------------------------- -------------------------------------------

**3.2 Git Branching Strategy**

  ----------------------- ------------------------------ ----------------------
  **Branch**              **Purpose**                    **Rules**

  **main**                Production --- always          Protected; require
                          deployable                     PR + passing CI to
                                                         merge

  **develop**             Integration branch --- daily   All feature branches
                          merges                         merge here first

  **feature/M{N}-name**   Individual module work         Branch from develop,
                                                         merge via PR

  **hotfix/issue-name**   Critical production fixes      Branch from main,
                                                         merge to both
                                                         main+develop
  ----------------------- ------------------------------ ----------------------

**3.3 CI/CD Pipeline Design**

ci.yml --- triggers on: push to develop, pull_request to main

-   Checkout code (actions/checkout@v4)

-   Setup Node 20 (actions/setup-node@v4 with cache:npm)

-   Install deps: npm ci \--workspaces

-   Lint: npm run lint \--workspaces

-   Type check: npm run type-check \--workspaces

-   Build: npm run build \--workspaces

-   Unit tests: npm run test \--workspaces

deploy.yml --- triggers on: push to main only

-   Checkout code

-   SSH to VPS (appleboy/ssh-action@v1) with VPS_SSH_KEY secret

-   Execute: cd /home/deploy/printbyfalcon && git pull origin main

-   Execute: docker compose -f docker-compose.prod.yml up -d \--build
    \--remove-orphans

-   Execute: docker system prune -f \--volumes (skip volumes with data)

-   Health check: curl -f https://api.printbyfalcon.com/health \|\| exit
    1

-   Notify on Slack/Telegram on success or failure

**3.4 Environment Management**

  ---------------------- --------------------------------------------------------------------
  **Variable Group**     **Variables**

  **Database**           DATABASE_URL=postgresql://user:pass@postgres-db:5432/printbyfalcon

  **Redis**              REDIS_URL=redis://redis-cache:6379

  **Meilisearch**        MEILI_HOST=http://meilisearch:7700 MEILI_MASTER_KEY=xxx

  **MinIO**              MINIO_ENDPOINT=minio MINIO_PORT=9000 MINIO_ACCESS_KEY=xxx
                         MINIO_SECRET_KEY=xxx MINIO_BUCKET=printbyfalcon-media

  **JWT**                JWT_SECRET=xxx JWT_EXPIRES_IN=15m JWT_REFRESH_SECRET=xxx
                         JWT_REFRESH_EXPIRES_IN=7d

  **Paymob**             PAYMOB_API_KEY=xxx PAYMOB_INTEGRATION_ID_CARD=xxx
                         PAYMOB_INTEGRATION_ID_FAWRY=xxx PAYMOB_HMAC_SECRET=xxx

  **Email/SMS**          SMTP_HOST=xxx SMTP_USER=xxx SMTP_PASS=xxx VONAGE_API_KEY=xxx
                         VONAGE_API_SECRET=xxx

  **App**                NEXT_PUBLIC_API_URL=https://api.printbyfalcon.com
                         ADMIN_IP_WHITELIST=x.x.x.x SENTRY_DSN=xxx
  ---------------------- --------------------------------------------------------------------

*Never commit .env to Git. Use .env.example with placeholders. GitHub
Secrets feed into deploy.yml which SSHs and writes
/home/deploy/printbyfalcon/.env.prod on first setup.*

**4. Architecture Implementation Details**

**4.1 Database Schema Design**

**Core Entity Groups**

  ------------------- --------------------------- --------------------------------------
  **Group**           **Models**                  **Key Fields**

  **Identity**        User, Address, RefreshToken id(UUID), email(unique), passwordHash,
                                                  role(enum), isActive, createdAt

  **Catalog**         Product, ProductImage,      id, nameAr, nameEn, slug(unique),
                      ProductVariant, Category,   descriptionAr, descriptionEn,
                      Brand                       price(Decimal), salePrice, stock,
                                                  isActive, status(enum)

  **Compatibility**   PrinterModel,               productId FK, printerModel string,
                      ProductCompatibility        pageYield int

  **Commerce**        Cart, CartItem, Order,      Cart→User(optional), Order has
                      OrderItem                   totalAmount, vatAmount,
                                                  shippingAmount, couponDiscount,
                                                  paymentMethod(enum)

  **Payment**         Payment                     orderId FK, paymobOrderId,
                                                  transactionId, amount, status(enum),
                                                  method(enum), hmacVerified

  **Logistics**       OrderTracking               orderId FK, status(enum), note,
                                                  courierName, trackingNumber, timestamp

  **Support**         SupportTicket, TicketReply  ticket has status(enum),
                                                  priority(enum), category(enum),
                                                  assignedToId FK

  **Promotions**      Coupon, FlashSale, Banner   Coupon: code(unique), type, value,
                                                  minOrder, maxUses, usesCount,
                                                  perCustomerLimit

  **Inventory**       StockAdjustment             productId FK, delta(+/-), reason,
                                                  adjustedByUserId, createdAt

  **Analytics**       SearchAnalytics, AuditLog   SearchAnalytics: query, resultsCount,
                                                  userId(optional). AuditLog: userId,
                                                  action, entityType, entityId,
                                                  diff(JSON)

  **Suppliers**       Supplier, PurchaseOrder,    PO status:
                      POItem                      DRAFT→SENT→CONFIRMED→RECEIVED→CLOSED
  ------------------- --------------------------- --------------------------------------

**Critical Indexes**

-   User: @@index(\[email\]) --- login lookup

-   Product: @@index(\[slug\]) --- product page load,
    @@index(\[categoryId, isActive\]) --- browse, @@index(\[brandId\])
    --- brand filter

-   Order: @@index(\[userId, status\]) --- my orders,
    @@index(\[createdAt\]) --- reports

-   OrderItem: @@index(\[orderId\]) --- order detail,
    @@index(\[productId\]) --- product analytics

-   CartItem: @@index(\[cartId\]) --- cart load

-   SearchAnalytics: @@index(\[query, createdAt\]) --- search reports

**4.2 NestJS Module Structure**

  ------------------------- ----------------------------------------------------
  **Module**                **src/ path and responsibilities**

  **AppModule**             Root --- imports all modules,
                            ConfigModule.forRoot({isGlobal:true}),
                            ThrottlerModule, BullModule

  **PrismaModule**          Global PrismaService wrapping PrismaClient,
                            onModuleInit connects

  **AuthModule**            auth.service, jwt.strategy, local.strategy,
                            jwt-refresh.strategy, auth.guard, roles.guard

  **UsersModule**           user.service --- findByEmail, findById,
                            updateProfile, manageAddresses

  **ProductsModule**        product.service, product.controller --- CRUD,
                            filters, compatibility, search fallback

  **CategoriesModule**      category.service --- tree structure, ordered list

  **BrandsModule**          brand.service --- CRUD + featured flag

  **SearchModule**          search.service --- Meilisearch client, indexProduct,
                            deleteProduct, search, autocomplete

  **UploadModule**          upload.service --- MinIO client, uploadFile(buffer,
                            filename, mimetype), getPublicUrl

  **CartModule**            cart.service --- Redis guest cart, DB user cart,
                            merge, validateStock, applyCoupon

  **WishlistModule**        wishlist.service --- CRUD, moveToCart, isWishlisted
                            check

  **OrdersModule**          order.service --- createOrder, stockDecrement,
                            getOrders, getOrder

  **PaymentsModule**        payment.service --- Paymob API calls, webhook
                            handler, HMAC validation, refund

  **NotificationsModule**   email.service (Nodemailer+HBS), sms.service
                            (Vonage), events via Bull queues

  **TrackingModule**        tracking.service --- addEvent, getTimeline

  **SupportModule**         ticket.service --- create, reply, assign, close,
                            rate

  **CouponsModule**         coupon.service --- validate, apply, usage tracking

  **AnalyticsModule**       analytics.service --- revenue, top products, search
                            terms, funnel metrics

  **AdminModule**           admin.guard (IP whitelist), re-exports all admin
                            controllers

  **HealthModule**          GET /health --- check DB, Redis, Meilisearch, MinIO
                            connectivity
  ------------------------- ----------------------------------------------------

**4.3 Auth Flow**

**Access Token Flow**

-   POST /auth/login → validate credentials → issue AT (15min, HS256) +
    RT (7 days, HS256 different secret)

-   AT payload: {sub: userId, email, role, iat, exp}

-   RT stored as bcrypt hash in RefreshToken table (one per
    device/session)

-   Every request: JwtAuthGuard extracts Bearer token, verifies, injects
    req.user

-   RolesGuard checks req.user.role against \@Roles() decorator ---
    throws ForbiddenException if mismatch

**Refresh Flow**

-   POST /auth/refresh --- send RT in body or httpOnly cookie

-   JwtRefreshStrategy validates RT, finds hash in DB, verifies bcrypt
    match

-   On success: delete old RT record, issue new AT + RT pair (rotation)

-   On failure: delete ALL RT records for user (compromise assumed)

**4.4 Caching Strategy (Redis)**

  ------------------------- ------------------ -------------------------------
  **Cache Key Pattern**     **TTL**            **Invalidation Strategy**

  **cart:{sessionId}**      24h (guest)        On item add/remove/update;
                                               delete on checkout

  **search:auto:{query}**   60s                Key expires; no manual
                                               invalidation needed

  **products:featured**     5 min              Flush on any product update via
                                               admin

  **categories:tree**       1 hour             Flush on category
                                               create/update/delete

  **session:{sessionId}**   7 days (auth)      Logout deletes key; refresh
                                               extends TTL

  **rate:login:{ip}**       15 min             Count increments; auto-expires
                                               after 15min window

  **search:popular**        10 min             Re-computed from
                                               SearchAnalytics on cache miss
  ------------------------- ------------------ -------------------------------

**5. DevOps & Deployment Plan**

**5.1 VPS Initial Setup Commands**

> apt update && apt upgrade -y
>
> apt install -y ufw fail2ban git curl wget htop nano unzip
>
> ufw default deny incoming && ufw default allow outgoing
>
> ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw
> enable
>
> adduser deploy && usermod -aG sudo deploy
>
> mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
>
> \# Paste your public key: nano /home/deploy/.ssh/authorized_keys &&
> chmod 600
>
> \# Edit: /etc/ssh/sshd_config → PermitRootLogin no,
> PasswordAuthentication no
>
> systemctl restart ssh
>
> curl -fsSL https://get.docker.com \| sh && usermod -aG docker deploy

**5.2 Docker Compose Production Config (Key Sections)**

> version: \'3.9\'
>
> services:
>
> postgres-db:
>
> image: postgres:16-alpine
>
> restart: always
>
> environment: \[POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD\] \# from
> .env
>
> volumes: \[postgres_data:/var/lib/postgresql/data\]
>
> deploy: {resources: {limits: {memory: 2g}}}
>
> redis-cache:
>
> image: redis:7-alpine
>
> restart: always
>
> command: redis-server \--requirepass \${REDIS_PASSWORD} \--maxmemory
> 512mb \--maxmemory-policy allkeys-lru
>
> meilisearch:
>
> image: getmeili/meilisearch:v1.6
>
> restart: always
>
> environment: \[MEILI_MASTER_KEY, MEILI_ENV=production\]
>
> deploy: {resources: {limits: {memory: 1g}}}
>
> minio:
>
> image: minio/minio:latest
>
> command: server /data \--console-address \':9001\'
>
> volumes: \[minio_data:/data\]
>
> restart: always
>
> nestjs-api:
>
> build: {context: ./apps/api, dockerfile: Dockerfile}
>
> restart: always
>
> depends_on: \[postgres-db, redis-cache, meilisearch, minio\]
>
> deploy: {resources: {limits: {memory: 512m}}}
>
> nextjs-app:
>
> build: {context: ./apps/web, dockerfile: Dockerfile}
>
> restart: always
>
> deploy: {resources: {limits: {memory: 1g}}}
>
> nginx:
>
> image: nginx:alpine
>
> ports: \[\'80:80\', \'443:443\'\]
>
> volumes: \[./nginx/nginx.conf:/etc/nginx/nginx.conf:ro,
> /etc/letsencrypt:/etc/letsencrypt:ro\]
>
> depends_on: \[nextjs-app, nestjs-api\]

**5.3 Nginx Config Strategy**

> \# /etc/nginx/nginx.conf
>
> upstream nextjs { server nextjs-app:3000; }
>
> upstream nestjs { server nestjs-api:4000; }
>
> server {
>
> listen 443 ssl http2;
>
> server_name printbyfalcon.com www.printbyfalcon.com;
>
> ssl_certificate /etc/letsencrypt/live/printbyfalcon.com/fullchain.pem;
>
> ssl_certificate_key
> /etc/letsencrypt/live/printbyfalcon.com/privkey.pem;
>
> ssl_protocols TLSv1.2 TLSv1.3; ssl_prefer_server_ciphers off;
>
> add_header Strict-Transport-Security \'max-age=63072000\' always;
>
> add_header X-Frame-Options DENY; add_header X-Content-Type-Options
> nosniff;
>
> gzip on; gzip_types text/plain text/css application/json
> application/javascript;
>
> location / { proxy_pass http://nextjs; proxy_set_header Host \$host;
> proxy_set_header X-Real-IP \$remote_addr; }
>
> }
>
> server {
>
> listen 443 ssl http2;
>
> server_name api.printbyfalcon.com;
>
> location / { proxy_pass http://nestjs; proxy_set_header Host \$host; }
>
> location /payments/callback { proxy_pass http://nestjs; \# allow
> Paymob IPs only via allow/deny }
>
> }

**5.4 Dockerfiles**

**apps/api/Dockerfile**

> FROM node:20-alpine AS builder
>
> WORKDIR /app
>
> COPY package\*.json ./
>
> RUN npm ci
>
> COPY . .
>
> RUN npx prisma generate
>
> RUN npm run build
>
> FROM node:20-alpine AS runner
>
> WORKDIR /app
>
> ENV NODE_ENV=production
>
> COPY \--from=builder /app/dist ./dist
>
> COPY \--from=builder /app/node_modules ./node_modules
>
> COPY \--from=builder /app/prisma ./prisma
>
> EXPOSE 4000
>
> CMD \[\"node\", \"dist/main.js\"\]

**apps/web/Dockerfile**

> FROM node:20-alpine AS builder
>
> WORKDIR /app
>
> COPY package\*.json ./
>
> RUN npm ci
>
> COPY . .
>
> RUN npm run build
>
> FROM node:20-alpine AS runner
>
> WORKDIR /app
>
> ENV NODE_ENV=production
>
> COPY \--from=builder /app/.next/standalone ./
>
> COPY \--from=builder /app/.next/static ./.next/static
>
> COPY \--from=builder /app/public ./public
>
> EXPOSE 3000
>
> CMD \[\"node\", \"server.js\"\]

**6. Production Readiness Checklist**

  ----------------- --------------------------------------------- --------------
  **Category**      **Check Item**                                **Priority**

  **Security**      ☐ HTTPS enforced on all endpoints --- HTTP    **Critical**
                    redirects to HTTPS                            

  **Security**      ☐ Helmet middleware active --- CSP, HSTS,     **Critical**
                    X-Frame-Options headers set                   

  **Security**      ☐ CORS locked to printbyfalcon.com only       **Critical**

  **Security**      ☐ Rate limiting on /auth/\* --- 5 req/15min   **Critical**
                    per IP                                        

  **Security**      ☐ Admin IP whitelist enforced --- returns 403 **Critical**
                    for unknown IPs                               

  **Security**      ☐ Paymob webhook HMAC validation on every     **Critical**
                    callback                                      

  **Security**      ☐ bcrypt cost factor 12 on all password       **Critical**
                    hashes                                        

  **Security**      ☐ JWT secrets are 256-bit random strings (not **Critical**
                    guessable)                                    

  **Security**      ☐ No .env file committed to Git               **Critical**

  **Security**      ☐ Prisma parameterized queries --- no raw SQL **High**
                    with user input                               

  **Security**      ☐ SQL injection test on all filter endpoints  **High**

  **Security**      ☐ Dependabot enabled on GitHub repo           **Medium**

  **Performance**   ☐ Redis caching on featured products,         **Critical**
                    categories, autocomplete                      

  **Performance**   ☐ Next.js output: standalone --- optimized    **Critical**
                    server bundle                                 

  **Performance**   ☐ Database indexes verified with EXPLAIN      **Critical**
                    ANALYZE on key queries                        

  **Performance**   ☐ Nginx gzip enabled for JSON and static      **High**
                    assets                                        

  **Performance**   ☐ MinIO bucket configured with proper CORS    **High**
                    for direct image access                       

  **Performance**   ☐ Meilisearch index warm --- all products     **Critical**
                    synced                                        

  **Performance**   ☐ Docker memory limits set --- no single      **Critical**
                    container can OOM the VPS                     

  **Config**        ☐ All env vars validated on app startup ---   **Critical**
                    throw if missing critical var                 

  **Config**        ☐ PAYMOB_LIVE=true and live integration IDs   **Critical**
                    in production .env                            

  **Config**        ☐ DATABASE_URL points to internal Docker      **Critical**
                    network (not localhost)                       

  **Config**        ☐ NEXT_PUBLIC_API_URL is HTTPS URL (not       **Critical**
                    localhost)                                    

  **Config**        ☐ Certbot auto-renewal cron active and tested **Critical**

  **Monitoring**    ☐ Sentry DSN configured in both Next.js and   **High**
                    NestJS                                        

  **Monitoring**    ☐ Uptime Kuma monitoring / with 60s interval  **High**
                    and Telegram alert                            

  **Monitoring**    ☐ Daily PostgreSQL backup cron running,       **Critical**
                    verified restore works                        

  **Monitoring**    ☐ Docker restart:always on all containers     **Critical**

  **Monitoring**    ☐ Log rotation configured --- max 7 days      **Medium**

  **Monitoring**    ☐ Health endpoint GET /health returns 200     **High**
                    with all service statuses                     

  **SEO/UX**        ☐ Sitemap.xml submitted to Google Search      **Medium**
                    Console                                       

  **SEO/UX**        ☐ robots.txt blocks /admin, /checkout, /api,  **Medium**
                    /cart                                         

  **SEO/UX**        ☐ Product pages have correct Schema.org       **High**
                    JSON-LD                                       

  **SEO/UX**        ☐ Arabic RTL layout renders correctly in      **Critical**
                    Chrome and Firefox                            

  **SEO/UX**        ☐ Language switcher persists choice to        **High**
                    localStorage and user profile                 

  **SEO/UX**        ☐ All images have alt text (EN and AR         **Medium**
                    versions)                                     
  ----------------- --------------------------------------------- --------------

  --- --------------------------------------------------------------------
  ▶   **LAUNCH GATE:** All CRITICAL items must be checked before go-live.
      HIGH items should be resolved within 48 hours of launch. MEDIUM
      items within Sprint 1 post-launch.

  --- --------------------------------------------------------------------
