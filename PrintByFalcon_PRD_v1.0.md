# PrintByFalcon — Product Requirements Document (PRD)

**Version:** 1.0 — Initial Release
**Date:** April 2025
**Status:** Draft — Awaiting Stakeholder Approval
**Domain:** printbyfalcon.com
**Hosting:** Hostinger KVM 2 VPS
**Primary Language:** Egyptian Arabic (العربية المصرية) | English

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope & Constraints](#2-scope--constraints)
3. [System Architecture](#3-system-architecture)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Customer-Facing Features](#5-customer-facing-features)
6. [Admin Panel Features](#6-admin-panel-features)
7. [Technical Requirements](#7-technical-requirements)
8. [API Overview](#8-api-overview)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Suggested Development Timeline](#10-suggested-development-timeline)
11. [Glossary](#11-glossary)
12. [Appendix — Document Control](#12-appendix--document-control)

---

## 1. Executive Summary

### 1.1 Project Overview

PrintByFalcon is a specialized B2C and B2B e-commerce platform dedicated to selling printers and all printing supplies in the Egyptian and broader Arab market. The platform will be accessible at **printbyfalcon.com** and will serve individual consumers, home office users, and corporate clients looking for original ink cartridges, compatible alternatives, paper rolls, spare parts, and multi-function devices.

### 1.2 Product Goals

- Deliver a seamless, end-to-end online shopping experience for printing products
- Implement intelligent search and advanced filtering to accelerate product discovery
- Support multiple payment methods tailored to the Egyptian market (Visa, Fawry, Cash on Delivery) via Paymob gateway
- Provide real-time order tracking from placement to delivery
- Build a comprehensive admin panel with role-based access control for staff management
- Launch a bilingual platform (Egyptian Arabic primary, English secondary) with easy language switching
- Ensure high performance, stability, and security on a Hostinger KVM 2 VPS

### 1.3 Target Audience

| Segment | Description | Use Case |
|---|---|---|
| Individual Consumers | Home users in Egypt and Arab countries | Buy ink cartridges, paper, small printers |
| Home Office / SMB | Small businesses and remote workers | Regular supply replenishment, multi-function devices |
| Corporate Clients | Medium to large enterprises | Bulk orders, branded supplies, service contracts |
| Resellers / Wholesalers | Printer supply distributors | Wholesale ordering, supplier integrations |

---

## 2. Scope & Constraints

### 2.1 In Scope

- Customer-facing storefront with full shopping experience
- User authentication, profiles, wishlists, and order history
- Smart search, product filtering, and browsing by brand/category
- Shopping cart and multi-step checkout
- Payment integration via Paymob (Visa/Mastercard, Fawry, Cash on Delivery)
- Real-time order tracking and status notifications (email/SMS)
- Bilingual UI: Egyptian Arabic (RTL) and English (LTR)
- Customer support chat / ticket system
- Admin panel with full product, order, and user management
- Role-based access control (Admin, Sales Manager, Customer Service)
- Supplier and brand management
- Sales analytics dashboard and reporting
- Dockerized deployment on Hostinger KVM 2 VPS with Nginx and Certbot (SSL)

### 2.2 Out of Scope (v1.0)

- Mobile native applications (iOS / Android)
- Integration with third-party ERP or accounting systems
- Auction or dynamic pricing mechanisms
- Subscription-based ink delivery service *(planned for v2.0)*

### 2.3 Assumptions & Constraints

| Type | Description |
|---|---|
| Infrastructure | Hostinger KVM 2 VPS: 2 vCPU, 8 GB RAM, 100 GB NVMe SSD, 8 TB bandwidth |
| Domain | printbyfalcon.com (already registered or to be registered) |
| Payment | Paymob merchant account with Fawry, card, and COD channels enabled |
| Language | Egyptian Arabic as default; English as optional alternate language |
| Currency | Egyptian Pound (EGP) as primary; USD display optional |
| Compliance | Must adhere to Egyptian e-commerce and consumer protection regulations |
| Timeline | MVP delivery within 16 weeks from project kick-off |

---

## 3. System Architecture

### 3.1 High-Level Architecture

The platform follows a containerized microservice-oriented architecture deployed on a single VPS using Docker Compose. All services are orchestrated behind an Nginx reverse proxy with TLS certificates managed by Certbot.

| Layer | Technology | Role |
|---|---|---|
| Frontend | Next.js 14 (React) | Server-Side Rendered storefront; bilingual (ar/en); RTL/LTR support |
| Backend API | NestJS (Node.js) | RESTful API with JWT authentication, business logic, Paymob integration |
| Database (Primary) | PostgreSQL 16 | Relational data: products, orders, users, inventory |
| Cache / Sessions | Redis 7 | Session store, cart cache, rate limiting, search suggestions |
| Search Engine | Meilisearch | Full-text smart search across products, brands, categories |
| File Storage | MinIO (S3-compatible) | Product images and document storage |
| Reverse Proxy | Nginx | SSL termination, static files, load balancing |
| SSL | Certbot (Let's Encrypt) | Automated certificate issuance and renewal |
| Containerization | Docker + Docker Compose | Service isolation, reproducible deployments |
| CI/CD | GitHub Actions | Automated build, test, and deploy pipeline from GitHub |

### 3.2 Deployment Architecture

All services run as Docker containers on the Hostinger KVM 2 VPS. GitHub is the source of truth; deployments are triggered by pushes to the `main` branch via GitHub Actions SSH deployment.

| Container | Port (Internal) | Description |
|---|---|---|
| `nextjs-app` | 3000 | Frontend Next.js application |
| `nestjs-api` | 4000 | Backend NestJS REST API |
| `postgres-db` | 5432 | PostgreSQL database |
| `redis-cache` | 6379 | Redis cache and session store |
| `meilisearch` | 7700 | Search engine service |
| `minio` | 9000 / 9001 | Object storage for product media |
| `nginx` | 80 / 443 | Reverse proxy, SSL, static files |

### 3.3 Docker Compose Structure (Overview)

```
printbyfalcon/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── nginx/
│   ├── nginx.conf
│   └── ssl/                  # Certbot managed
├── apps/
│   ├── web/                  # Next.js frontend
│   └── api/                  # NestJS backend
├── packages/
│   └── shared/               # Shared TypeScript types
└── scripts/
    ├── deploy.sh
    └── backup.sh
```

### 3.4 Performance Targets on KVM 2 VPS

- Page load time (First Contentful Paint): **< 2.5 seconds**
- API response time (P95): **< 300ms**
- Concurrent users supported: **200+ simultaneous sessions**
- Database query time (P95): **< 100ms** with proper indexing
- Uptime SLA: **99.5%**
- SSL certificate auto-renewal via Certbot cron job

---

## 4. User Roles & Permissions

| Role | Access Level | Key Capabilities |
|---|---|---|
| Guest | Public | Browse products, search, view product details, add to cart (session-based) |
| Registered Customer | Authenticated | All guest access + account management, wishlist, order history, order tracking, checkout |
| Customer Service Agent | Staff | View/respond to support tickets, view order details, update order status (limited), access customer profiles |
| Sales Manager | Staff | Full product & inventory management, order management, discount/coupon management, basic analytics |
| Supplier | External | View purchase orders, update delivery status, manage their product catalog entries |
| Super Admin | Full Access | All capabilities: user/role management, full analytics, financial reports, system settings, audit logs |

### 4.1 Permission Matrix

| Permission | Super Admin | Sales Manager | Customer Service |
|---|---|---|---|
| Product Management | Full | Full | View Only |
| Order Management | Full | Full | View + Update Status |
| Customer Management | Full | View Only | Full |
| Support Tickets | Full | View Only | Full |
| Analytics & Reports | Full | Limited | None |
| Staff Management | Full | None | None |
| System Settings | Full | None | None |
| Supplier Management | Full | Full | None |
| Promotions & Coupons | Full | Full | View Only |

---

## 5. Customer-Facing Features

### 5.1 Authentication & User Account

#### 5.1.1 Registration & Login

- Register with email + password or mobile number + OTP
- Social login via Google *(optional v1.1)*
- Email verification upon registration
- Forgot password via email reset link or OTP
- Persistent login with JWT refresh tokens (7-day rolling window)

#### 5.1.2 User Profile

- Edit personal information (name, email, phone)
- Manage multiple delivery addresses (default + saved addresses)
- View complete order history with status and re-order functionality
- Manage wishlist / saved items
- Language preference setting (Arabic / English)
- Notification preferences (email, SMS)

---

### 5.2 Product Discovery

#### 5.2.1 Smart Search

The search system must support intelligent, forgiving queries in both Arabic and English, including partial matches, typo tolerance, and synonym handling.

- Search by product name, brand, model number, or category keyword
- Autocomplete / type-ahead suggestions powered by Meilisearch
- Typo-tolerant fuzzy matching (e.g., "HP Lserjet" finds "HP LaserJet")
- Synonym support (e.g., "حبر" = "ink" = "cartridge")
- Search history for logged-in users
- "No results" page with smart suggestions and popular alternatives
- Search analytics tracked for admin insights

#### 5.2.2 Product Filtering & Sorting

| Filter Type | Options |
|---|---|
| Category | Printers, Ink Cartridges (Original / Compatible), Toner, Paper & Media, Spare Parts, Multi-Function |
| Brand | HP, Canon, Epson, Brother, Lexmark, Samsung, and all active brands |
| Price Range | Slider with min/max in EGP |
| Printer Compatibility | Compatible with [Printer Model] — links cartridges to specific printer models |
| Availability | In Stock, Pre-Order |
| Rating | 4 stars and above, 3 stars and above |
| Discount | On Sale / Discounted items only |

**Sorting options:** Most Relevant, Lowest Price, Highest Price, Best Sellers, Newest Arrivals, Highest Rated

- Active filters displayed as removable tags with "Clear All" option
- Filter state preserved in URL for shareable filtered pages

#### 5.2.3 Product Browsing

- Homepage: Hero banner, featured products, deals of the day, top brands, new arrivals
- Category pages with thumbnail grid and list view toggle
- Brand pages with brand profile and complete product catalog
- "Compatible with your printer" cross-sell section on product pages
- Recently viewed products (stored in browser + account)

#### 5.2.4 Product Detail Page

- Multiple product images with zoom
- Product name, SKU, brand, compatibility list
- Price with original and discounted price display
- Stock availability indicator (In Stock / Low Stock / Out of Stock)
- Full product description with specifications table
- Add to Cart and Add to Wishlist buttons
- Quantity selector
- Customer reviews and ratings
- Related products and compatible supplies carousel

---

### 5.3 Shopping Cart

- Persistent cart: saved across sessions for logged-in users, session-based for guests
- View and edit cart (update quantities, remove items)
- Real-time stock validation on cart updates
- Subtotal, estimated shipping, and VAT breakdown
- Apply coupon / discount code
- "Save for Later" to move items to wishlist
- Cart badge counter in navigation header

---

### 5.4 Wishlist / Favorites

- Add/remove products from wishlist with one click
- Wishlist page with product cards and "Add to Cart" from wishlist
- "Back In Stock" notification trigger for out-of-stock wishlisted items
- Share wishlist via link *(optional)*

---

### 5.5 Checkout & Payment

#### 5.5.1 Checkout Flow

1. Address selection or entry (saved addresses or new)
2. Shipping method selection (Standard / Express)
3. Order review — items, quantities, prices, address confirmation
4. Payment method selection
5. Order confirmation and receipt

#### 5.5.2 Payment Methods (via Paymob Gateway)

| Method | Channel | Notes |
|---|---|---|
| Visa / Mastercard | Paymob Card Payments | 3DS authentication; instant confirmation |
| Fawry | Paymob Fawry Integration | Reference code generated; valid 24 hours; customer pays at Fawry outlet |
| Cash on Delivery (COD) | Internal + Paymob COD | Available within supported delivery zones; additional COD fee may apply |
| Mobile Wallets | Paymob Wallets | Vodafone Cash, Orange Cash, Etisalat Cash — to be enabled in v1.1 |

#### 5.5.3 Order Confirmation

- Immediate on-screen order confirmation with order number
- Confirmation email with order summary and payment details
- SMS notification with order reference

---

### 5.6 Order Tracking

- Dedicated "My Orders" page with order status timeline
- Real-time order status flow:

  ```
  Order Placed → Payment Confirmed → Processing → Shipped → Out for Delivery → Delivered
  ```

- Tracking number with link to courier tracking page
- Estimated delivery date display
- Push / email / SMS notifications on each status change
- Return request initiation from order detail page

---

### 5.7 Customer Support

- Live chat widget integrated into all pages (pre-sale inquiries, product questions, order issues)
- Support ticket submission form with category selection:
  - Product Inquiry
  - Order Issue
  - Technical Support
  - Returns & Refunds
- Ticket tracking — customers can view status and replies
- WhatsApp integration button for direct WhatsApp contact *(optional)*
- FAQ section covering shipping, returns, payment, and products

---

## 6. Admin Panel Features

### 6.1 Dashboard Overview

- Summary cards: Total Revenue (today/week/month), Total Orders, Pending Orders, New Customers, Low Stock Alerts
- Revenue trend chart (daily/weekly/monthly toggle)
- Top-selling products and top brands
- Recent orders table with quick status update
- Notifications panel: low stock alerts, new support tickets, failed payments

---

### 6.2 User & Staff Management

#### 6.2.1 Customer Management

- View all registered customers with search and filter
- Customer profile: personal info, order history, wishlist, support tickets
- Block / unblock customer accounts
- Export customer list to CSV

#### 6.2.2 Staff & Role Management

- Create staff accounts with defined roles (Super Admin, Sales Manager, Customer Service Agent)
- Role-based permissions: granular control over which modules each role can access
- Deactivate or delete staff accounts
- Activity audit log: track all staff actions with timestamp and user

---

### 6.3 Catalog Management

#### 6.3.1 Category Management

- Create, edit, delete product categories and subcategories
- Assign category icons, banners, and SEO metadata
- Drag-and-drop category ordering

#### 6.3.2 Brand Management

- Add, edit, and delete brands (name, logo, description, country of origin)
- Associate brands with categories
- Brand-level promotions and featured flags

#### 6.3.3 Product Management

- Add new products with: name (AR/EN), description, SKU, barcode, category, brand, price, sale price, images, specifications
- Printer compatibility matrix: link cartridges to compatible printer models
- Manage product variants (e.g., different page-yield versions of same cartridge)
- Bulk product import via CSV/Excel template
- Product duplication for quick addition of similar items
- SEO fields: meta title, meta description, URL slug
- Product status: Active, Draft, Archived

#### 6.3.4 Inventory Management

- Real-time stock levels per product/variant
- Low stock threshold alerts (configurable per product)
- Manual stock adjustment with reason logging
- Stock history log for audit purposes

---

### 6.4 Supplier Management

- Add and manage supplier profiles: company name, contact, payment terms, address
- Associate products with their respective suppliers
- Create and manage purchase orders (POs)
- Track PO status: `Draft → Sent → Confirmed → Received → Closed`
- Supplier performance tracking (delivery times, fulfillment rates)

---

### 6.5 Order Management

- View all orders with advanced filters (status, date range, payment method, customer)
- Order detail view: items, customer info, shipping address, payment status, timeline
- Update order status manually (e.g., mark as shipped, add tracking number)
- Process refunds and cancellations
- Print invoice / packing slip
- Bulk status update for multiple orders
- Order export to CSV/Excel

---

### 6.6 Promotions & Coupons

- Create discount coupons: percentage off, fixed amount, free shipping
- Set coupon validity period, usage limit (per customer / total uses)
- Minimum order value requirement
- Product-specific or category-specific coupons
- Flash sale / limited-time deal scheduling
- Homepage banner and promotional section management

---

### 6.7 Customer Support Management

- Support ticket inbox: view, assign to agent, reply, and close tickets
- Ticket categorization and priority tagging (Low / Medium / High / Urgent)
- Internal notes on tickets (visible to staff only)
- Live chat agent dashboard with active conversation management
- Customer satisfaction rating after ticket resolution

---

### 6.8 Analytics & Reporting

#### 6.8.1 Sales Analytics

- Revenue reports: daily, weekly, monthly, custom date range
- Revenue breakdown by category, brand, and product
- Order count, average order value, conversion rate
- Revenue by payment method

#### 6.8.2 Product Analytics

- Best-selling products by revenue and units sold
- Slow-moving inventory report
- Product views vs. add-to-cart vs. purchase funnel
- Search terms report: what customers search for most

#### 6.8.3 Customer Analytics

- New vs. returning customers over time
- Customer lifetime value (CLV) tracking
- Geographic distribution of orders
- Abandoned cart rate and recovery metrics

#### 6.8.4 Report Export

- Export all reports to Excel (.xlsx) or CSV
- Schedule automated reports emailed to admins (daily/weekly/monthly)

---

## 7. Technical Requirements

### 7.1 Technology Stack

| Component | Technology | Version / Notes |
|---|---|---|
| Frontend Framework | Next.js | v14+ with App Router; SSR + SSG hybrid |
| Frontend Language | TypeScript | Strict mode enabled |
| Styling | Tailwind CSS | With RTL support via `tailwindcss-rtl` |
| State Management | Zustand + React Query | Client state + server state separation |
| Backend Framework | NestJS | v10+; modular architecture |
| Backend Language | TypeScript | Strict mode |
| ORM | Prisma | Type-safe database access with migrations |
| Primary Database | PostgreSQL | v16; connection pooling via PgBouncer |
| Cache | Redis | v7; session store, rate limiting, cart cache |
| Search | Meilisearch | v1.x; typo-tolerant full-text search |
| File Storage | MinIO | S3-compatible object storage on VPS |
| Authentication | JWT + Passport.js | Access token (15 min) + refresh token (7 days) |
| Payment | Paymob Node SDK | Card, Fawry, COD channels |
| Email | Nodemailer + SMTP / SendGrid | Transactional emails |
| SMS | Vonage / Twilio (Egypt) | OTP and order notification SMS |
| Containerization | Docker + Docker Compose | Multi-service orchestration |
| Web Server | Nginx | Reverse proxy, static file serving, gzip compression |
| SSL | Certbot | Let's Encrypt auto-renewal |
| CI/CD | GitHub Actions | Build → Test → Deploy to VPS via SSH |

### 7.2 Internationalization (i18n)

- Primary language: Egyptian Arabic (`ar-EG`) with full RTL layout
- Secondary language: English (`en-US`) with LTR layout
- Language selection persisted in user account and local storage
- All UI strings externalized to translation JSON files
- Product names, descriptions, and categories stored in both languages
- Number, currency, and date formatting per locale

### 7.3 Security Requirements

- HTTPS enforced on all endpoints; HTTP automatically redirected to HTTPS
- Input validation and sanitization on all API endpoints
- SQL injection prevention via parameterized queries (Prisma ORM)
- XSS prevention via React's built-in escaping + Content Security Policy headers
- CSRF protection on all state-changing API endpoints
- Rate limiting on authentication endpoints (max 5 failed logins before lockout)
- Paymob 3DS authentication for card payments
- PCI-DSS compliance: card data never stored on our servers (handled entirely by Paymob)
- Admin panel restricted to staff IP whitelist (configurable)
- Passwords hashed with bcrypt (cost factor 12)
- Dependency vulnerability scanning via GitHub Dependabot

### 7.4 SEO Requirements

- Server-Side Rendering (SSR) for all product and category pages
- Unique, descriptive `<title>` and meta description per page
- Canonical URLs to avoid duplicate content
- Schema.org structured data (`Product`, `BreadcrumbList`, `Organization`)
- XML sitemap auto-generated and submitted to Google Search Console
- `robots.txt` configured to allow product/category pages, block admin/checkout
- Open Graph and Twitter Card meta tags for social sharing
- Arabic-language SEO considerations (RTL, Arabic keywords)

### 7.5 Backup & Recovery

- Automated daily PostgreSQL database backups stored off-VPS
- 7-day backup retention policy
- Backup restoration procedure documented and tested quarterly
- Docker volume backups for MinIO (product images)

---

## 8. API Overview

The backend exposes a RESTful API under `/api/v1`. All endpoints return JSON. Authentication is via `Bearer` JWT token in the `Authorization` header.

| Module | Key Endpoints | Auth Required |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/forgot-password` | No |
| Products | `GET /products`, `GET /products/:id`, `GET /products/search` | No |
| Categories | `GET /categories`, `GET /categories/:id/products` | No |
| Brands | `GET /brands`, `GET /brands/:id/products` | No |
| Cart | `GET /PUT /POST /DELETE /cart` | Optional (guest via session) |
| Wishlist | `GET /POST /DELETE /wishlist` | Yes |
| Orders | `POST /orders/checkout`, `GET /orders`, `GET /orders/:id` | Yes |
| Payments | `POST /payments/initiate`, `POST /payments/callback` (Paymob webhook) | Yes / Webhook |
| Tracking | `GET /orders/:id/tracking` | Yes |
| Support | `POST /support/tickets`, `GET /support/tickets/:id`, `POST /support/tickets/:id/reply` | Yes |
| Admin — Products | `CRUD /admin/products`, `/admin/categories`, `/admin/brands` | Admin+ |
| Admin — Orders | `GET /PATCH /admin/orders`, `GET /admin/orders/:id` | Admin+ |
| Admin — Users | `GET /admin/users`, `PATCH /admin/users/:id` | Super Admin |
| Admin — Analytics | `GET /admin/analytics/sales`, `/admin/analytics/products` | Admin+ |
| Admin — Reports | `GET /admin/reports/export` | Admin+ |

---

## 9. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| Performance | Page load (FCP) | < 2.5 seconds |
| Performance | API latency (P95) | < 300ms |
| Performance | Search response time | < 100ms |
| Scalability | Concurrent users (v1.0) | 200+ simultaneous |
| Availability | Platform uptime | 99.5% monthly |
| Security | SSL rating | A+ on SSL Labs |
| Security | OWASP Top 10 | All addressed before launch |
| Accessibility | WCAG compliance | Level AA |
| SEO | Google PageSpeed (Mobile) | Score ≥ 80 |
| Data Retention | Database backups | Daily, 7-day retention |
| Monitoring | Error tracking | Sentry integration |
| Monitoring | Server monitoring | Uptime Kuma or Netdata on VPS |

---

## 10. Suggested Development Timeline

| Phase | Duration | Deliverables |
|---|---|---|
| Phase 1 — Foundation | Weeks 1–2 | Project setup, Docker environment, database schema design, auth module, CI/CD pipeline, domain and SSL configuration |
| Phase 2 — Core Catalog | Weeks 3–5 | Product, category, brand CRUD; image upload; Meilisearch integration; smart search and filters; product detail page |
| Phase 3 — Shopping Experience | Weeks 6–8 | Cart, wishlist, checkout flow, Paymob integration (card, Fawry, COD), order confirmation emails/SMS |
| Phase 4 — Order & Support | Weeks 9–10 | Order tracking, status notifications, customer support ticket system, live chat widget integration |
| Phase 5 — Admin Panel | Weeks 11–13 | Full admin dashboard, staff management, analytics, reports, supplier management, promotions |
| Phase 6 — i18n & Polish | Week 14 | Full Arabic/English bilingual implementation, RTL styling, SEO optimization, accessibility review |
| Phase 7 — Testing & QA | Week 15 | End-to-end testing, performance testing, security audit, bug fixing, cross-browser testing |
| Phase 8 — Launch | Week 16 | Production deployment on Hostinger KVM 2, smoke testing, monitoring setup, go-live |

---

## 11. Glossary

| Term | Definition |
|---|---|
| SKU | Stock Keeping Unit — unique identifier for each product variant |
| COD | Cash on Delivery — customer pays when the order is physically delivered |
| EGP | Egyptian Pound — primary currency of the platform |
| RTL | Right-to-Left — text direction used for Arabic language |
| SSR | Server-Side Rendering — page HTML generated on the server for SEO and performance |
| JWT | JSON Web Token — standard for stateless authentication |
| PO | Purchase Order — formal document sent to a supplier for goods |
| PRD | Product Requirements Document — this document |
| KVM | Kernel-based Virtual Machine — virtualization technology used by Hostinger VPS |
| Meilisearch | Open-source, typo-tolerant search engine used for product search |
| Paymob | Egyptian payment gateway supporting cards, Fawry, and mobile wallets |
| Fawry | Egyptian payment network allowing payments at physical retail outlets |
| MinIO | Open-source S3-compatible object storage for images and files |
| NestJS | Progressive Node.js framework for building efficient server-side applications |
| Next.js | React framework supporting SSR, SSG, and API routes |
| FCP | First Contentful Paint — a web performance metric measuring perceived load speed |
| CLV | Customer Lifetime Value — total revenue a customer is expected to generate |
| i18n | Internationalization — the process of designing software for multiple languages |

---

## 12. Appendix — Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | April 2025 | PrintByFalcon Team | Initial draft — full scope, architecture, features, and timeline |

---

> *This document is confidential and intended solely for the PrintByFalcon project stakeholders and development team. Please direct any questions, corrections, or change requests to the Product Owner.*
