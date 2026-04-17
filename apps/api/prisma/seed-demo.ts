/**
 * Demo seed for end-to-end testing.
 * Safe to run multiple times — it upserts by unique keys and clears previous
 * demo orders/tickets/coupons before re-inserting.
 *
 *   docker compose -f docker-compose.prod.yml exec nestjs-api node -r ts-node/register prisma/seed-demo.ts
 *   # or
 *   cd apps/api && npx ts-node prisma/seed-demo.ts
 */

import {
  PrismaClient, Role, ProductStatus, OrderStatus, PaymentMethod, PaymentStatus,
  TicketStatus, TicketPriority, TicketCategory, CouponType, POStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const invoiceNumber = (offset = 0) => {
  const d = new Date(Date.now() - offset * 86_400_000);
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `FLN-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
};

async function main() {
  console.log('🌱 DEMO SEED — populating for full website QA');

  // ─── 1. Foundation: categories + brands (upsert) ──────────────────
  const [catPrinters, catInk, catToner, catPaper, catSpare] = await Promise.all([
    prisma.category.upsert({ where: { slug: 'printers' }, update: {}, create: { nameAr: 'طابعات', nameEn: 'Printers', slug: 'printers', sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'ink-cartridges' }, update: {}, create: { nameAr: 'خراطيش حبر', nameEn: 'Ink Cartridges', slug: 'ink-cartridges', sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'toner' }, update: {}, create: { nameAr: 'خراطيش تونر', nameEn: 'Toner Cartridges', slug: 'toner', sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: 'paper-media' }, update: {}, create: { nameAr: 'ورق ووسائط طباعة', nameEn: 'Paper & Media', slug: 'paper-media', sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: 'spare-parts' }, update: {}, create: { nameAr: 'قطع غيار', nameEn: 'Spare Parts', slug: 'spare-parts', sortOrder: 5 } }),
  ]);

  const [bHp, bCanon, bEpson, bBrother, bLexmark, bGeneric] = await Promise.all([
    prisma.brand.upsert({ where: { slug: 'hp' }, update: {}, create: { nameEn: 'HP', nameAr: 'اتش بي', slug: 'hp', country: 'USA', isFeatured: true } }),
    prisma.brand.upsert({ where: { slug: 'canon' }, update: {}, create: { nameEn: 'Canon', nameAr: 'كانون', slug: 'canon', country: 'Japan', isFeatured: true } }),
    prisma.brand.upsert({ where: { slug: 'epson' }, update: {}, create: { nameEn: 'Epson', nameAr: 'ابسون', slug: 'epson', country: 'Japan', isFeatured: true } }),
    prisma.brand.upsert({ where: { slug: 'brother' }, update: {}, create: { nameEn: 'Brother', nameAr: 'براذر', slug: 'brother', country: 'Japan', isFeatured: true } }),
    prisma.brand.upsert({ where: { slug: 'lexmark' }, update: {}, create: { nameEn: 'Lexmark', nameAr: 'ليكسمارك', slug: 'lexmark', country: 'USA', isFeatured: false } }),
    prisma.brand.upsert({ where: { slug: 'generic' }, update: {}, create: { nameEn: 'Generic', nameAr: 'متنوع', slug: 'generic', country: 'N/A', isFeatured: false } }),
  ]);
  console.log(`   ✅ 5 categories · 6 brands`);

  // ─── 2. Products — 30 SKUs across 5 categories ────────────────────
  const products = [
    // Ink cartridges
    { slug: 'hp-680-black-ink', sku: 'HP-680-BK', nameEn: 'HP 680 Black Ink Cartridge', nameAr: 'خرطوشة حبر HP 680 أسود', descriptionEn: 'Genuine HP 680 black ink cartridge. 480-page yield.', descriptionAr: 'خرطوشة حبر HP 680 أصلية. إنتاج ٤٨٠ صفحة.', price: 299, stock: 50, categoryId: catInk.id, brandId: bHp.id, compatibility: { models: ['DeskJet 2335', 'DeskJet 2775', 'DeskJet 4535'] }, soldCount: 42 },
    { slug: 'hp-680-color-ink', sku: 'HP-680-CL', nameEn: 'HP 680 Color Ink Cartridge', nameAr: 'خرطوشة حبر HP 680 ملونة', descriptionEn: 'Tri-colour cartridge. Vivid, archival inks.', descriptionAr: 'خرطوشة ثلاثية الألوان. ألوان زاهية أصيلة.', price: 349, stock: 40, categoryId: catInk.id, brandId: bHp.id, compatibility: { models: ['DeskJet 2335', 'DeskJet 2775', 'DeskJet 4535'] }, soldCount: 38 },
    { slug: 'hp-304-black-ink', sku: 'HP-304-BK', nameEn: 'HP 304 Black Ink Cartridge', nameAr: 'خرطوشة حبر HP 304 أسود', price: 389, stock: 30, categoryId: catInk.id, brandId: bHp.id, compatibility: { models: ['DeskJet 2620', 'DeskJet 3720'] }, soldCount: 22 },
    { slug: 'hp-304-tri-color-ink', sku: 'HP-304-CL', nameEn: 'HP 304 Tri-Color Ink Cartridge', nameAr: 'خرطوشة حبر HP 304 ثلاثية الألوان', price: 449, salePrice: 399, stock: 25, categoryId: catInk.id, brandId: bHp.id, compatibility: { models: ['DeskJet 2620', 'DeskJet 3720'] }, soldCount: 19 },
    { slug: 'canon-pg-745-black', sku: 'CN-PG745-BK', nameEn: 'Canon PG-745 Black Ink Cartridge', nameAr: 'خرطوشة حبر Canon PG-745 أسود', price: 275, stock: 35, categoryId: catInk.id, brandId: bCanon.id, compatibility: { models: ['PIXMA iP2870', 'PIXMA MG2570S'] }, soldCount: 31 },
    { slug: 'canon-cl-746-color', sku: 'CN-CL746-CL', nameEn: 'Canon CL-746 Color Ink Cartridge', nameAr: 'خرطوشة حبر Canon CL-746 ملونة', price: 325, stock: 28, categoryId: catInk.id, brandId: bCanon.id, compatibility: { models: ['PIXMA iP2870', 'PIXMA MG2570S'] }, soldCount: 24 },
    { slug: 'canon-cli-821-color-set', sku: 'CN-CLI821-SET', nameEn: 'Canon CLI-821 Color Set (CMY)', nameAr: 'طقم ألوان Canon CLI-821', price: 890, salePrice: 799, stock: 12, categoryId: catInk.id, brandId: bCanon.id, compatibility: { models: ['PIXMA iP4870', 'PIXMA MX878'] }, soldCount: 8 },
    { slug: 'epson-664-black', sku: 'EP-664-BK', nameEn: 'Epson 664 Black Ink Bottle', nameAr: 'زجاجة حبر Epson 664 أسود', descriptionEn: 'For Epson EcoTank L-series. 70ml bottle.', descriptionAr: 'لسلسلة EcoTank من Epson. زجاجة ٧٠ مل.', price: 215, stock: 60, categoryId: catInk.id, brandId: bEpson.id, compatibility: { models: ['L3110', 'L3150', 'L3250', 'L5190'] }, soldCount: 54 },
    { slug: 'epson-664-cyan', sku: 'EP-664-CY', nameEn: 'Epson 664 Cyan Ink Bottle', nameAr: 'زجاجة حبر Epson 664 سماوي', price: 215, stock: 50, categoryId: catInk.id, brandId: bEpson.id, compatibility: { models: ['L3110', 'L3150', 'L3250', 'L5190'] }, soldCount: 47 },
    { slug: 'epson-664-magenta', sku: 'EP-664-MG', nameEn: 'Epson 664 Magenta Ink Bottle', nameAr: 'زجاجة حبر Epson 664 أحمر', price: 215, stock: 50, categoryId: catInk.id, brandId: bEpson.id, compatibility: { models: ['L3110', 'L3150', 'L3250', 'L5190'] }, soldCount: 46 },
    { slug: 'epson-664-yellow', sku: 'EP-664-YL', nameEn: 'Epson 664 Yellow Ink Bottle', nameAr: 'زجاجة حبر Epson 664 أصفر', price: 215, stock: 45, categoryId: catInk.id, brandId: bEpson.id, compatibility: { models: ['L3110', 'L3150', 'L3250', 'L5190'] }, soldCount: 44 },
    { slug: 'brother-lc3619-black', sku: 'BR-LC3619-BK', nameEn: 'Brother LC3619 XL Black', nameAr: 'خرطوشة Brother LC3619 XL أسود', price: 465, stock: 18, categoryId: catInk.id, brandId: bBrother.id, compatibility: { models: ['MFC-J2330DW', 'MFC-J3530DW'] }, soldCount: 7 },
    // Toner
    { slug: 'hp-26a-toner', sku: 'HP-26A-TN', nameEn: 'HP 26A Black Toner (CF226A)', nameAr: 'تونر HP 26A أسود', descriptionEn: 'Yields ~3,100 pages. For LaserJet Pro M402/M426.', descriptionAr: 'إنتاج ٣١٠٠ صفحة. لـ LaserJet Pro M402/M426.', price: 2890, stock: 15, categoryId: catToner.id, brandId: bHp.id, compatibility: { models: ['LaserJet Pro M402', 'LaserJet Pro M426'] }, soldCount: 11 },
    { slug: 'hp-78a-toner', sku: 'HP-78A-TN', nameEn: 'HP 78A Black Toner (CE278A)', nameAr: 'تونر HP 78A أسود', price: 1950, salePrice: 1690, stock: 20, categoryId: catToner.id, brandId: bHp.id, compatibility: { models: ['LaserJet P1566', 'LaserJet P1606'] }, soldCount: 16 },
    { slug: 'canon-045-black-toner', sku: 'CN-045-BK', nameEn: 'Canon 045 Black Toner', nameAr: 'تونر Canon 045 أسود', price: 2250, stock: 10, categoryId: catToner.id, brandId: bCanon.id, compatibility: { models: ['imageCLASS MF631', 'MF633'] }, soldCount: 6 },
    { slug: 'brother-tn2345-toner', sku: 'BR-TN2345', nameEn: 'Brother TN-2345 Black Toner', nameAr: 'تونر Brother TN-2345 أسود', price: 1100, stock: 22, categoryId: catToner.id, brandId: bBrother.id, compatibility: { models: ['HL-L2360DN', 'DCP-L2540DW'] }, soldCount: 14 },
    // Printers
    { slug: 'hp-deskjet-2335', sku: 'HP-DJ-2335', nameEn: 'HP DeskJet 2335 All-in-One Printer', nameAr: 'طابعة HP DeskJet 2335 متعددة الوظائف', descriptionEn: 'Print, scan, copy. Compact home printer.', descriptionAr: 'طباعة، مسح، نسخ. طابعة منزلية مدمجة.', price: 1899, stock: 15, categoryId: catPrinters.id, brandId: bHp.id, soldCount: 12 },
    { slug: 'hp-laserjet-m404dn', sku: 'HP-LJ-M404DN', nameEn: 'HP LaserJet Pro M404dn', nameAr: 'طابعة HP LaserJet Pro M404dn', price: 8990, salePrice: 7990, stock: 5, categoryId: catPrinters.id, brandId: bHp.id, soldCount: 3 },
    { slug: 'canon-pixma-g3420', sku: 'CN-PX-G3420', nameEn: 'Canon PIXMA G3420 Wireless Printer', nameAr: 'طابعة Canon PIXMA G3420 لاسلكية', price: 5490, stock: 8, categoryId: catPrinters.id, brandId: bCanon.id, soldCount: 5 },
    { slug: 'epson-l3250', sku: 'EP-L3250', nameEn: 'Epson EcoTank L3250 Multifunction', nameAr: 'طابعة Epson L3250 متعددة الوظائف', price: 5499, salePrice: 4999, stock: 8, categoryId: catPrinters.id, brandId: bEpson.id, soldCount: 9 },
    { slug: 'epson-l5290', sku: 'EP-L5290', nameEn: 'Epson EcoTank L5290 with ADF', nameAr: 'طابعة Epson L5290 مع ADF', price: 8290, stock: 4, categoryId: catPrinters.id, brandId: bEpson.id, soldCount: 2 },
    { slug: 'brother-hl-l2375dw', sku: 'BR-HL-L2375DW', nameEn: 'Brother HL-L2375DW Mono Laser', nameAr: 'طابعة Brother HL-L2375DW ليزر أسود', price: 4790, stock: 6, categoryId: catPrinters.id, brandId: bBrother.id, soldCount: 4 },
    // Paper & media
    { slug: 'hp-a4-premium-500', sku: 'HP-PA4-500', nameEn: 'HP Premium A4 Paper · 500 Sheets', nameAr: 'ورق HP A4 فاخر · ٥٠٠ ورقة', descriptionEn: '80gsm bright white. Laser & inkjet compatible.', descriptionAr: '٨٠ جرام أبيض ناصع. متوافق مع الليزر والحبر.', price: 165, stock: 200, categoryId: catPaper.id, brandId: bHp.id, soldCount: 180 },
    { slug: 'double-a-a4-500', sku: 'DA-A4-500', nameEn: 'Double A · A4 Paper · 500 Sheets', nameAr: 'ورق Double A · A4 · ٥٠٠ ورقة', price: 185, stock: 150, categoryId: catPaper.id, brandId: bGeneric.id, soldCount: 145 },
    { slug: 'epson-photo-glossy-a4', sku: 'EP-PHOTO-GL', nameEn: 'Epson Photo Glossy A4 · 50 Sheets', nameAr: 'ورق Epson لامع A4 · ٥٠ ورقة', price: 420, salePrice: 380, stock: 30, categoryId: catPaper.id, brandId: bEpson.id, soldCount: 25 },
    { slug: 'canon-matt-photo-a4', sku: 'CN-MATT-A4', nameEn: 'Canon Matt Photo Paper A4 · 50 Sheets', nameAr: 'ورق Canon مطفي A4 · ٥٠ ورقة', price: 380, stock: 20, categoryId: catPaper.id, brandId: bCanon.id, soldCount: 14 },
    // Spare parts
    { slug: 'hp-drum-19a', sku: 'HP-19A-DR', nameEn: 'HP 19A Imaging Drum', nameAr: 'درم HP 19A', price: 1890, stock: 8, categoryId: catSpare.id, brandId: bHp.id, soldCount: 3 },
    { slug: 'fuser-assembly-2015', sku: 'FUSER-2015', nameEn: 'Fuser Assembly · HP LaserJet P2015', nameAr: 'وحدة التثبيت · HP LaserJet P2015', price: 2350, stock: 4, categoryId: catSpare.id, brandId: bGeneric.id, soldCount: 1 },
    { slug: 'pickup-roller-kit', sku: 'PICKUP-KIT', nameEn: 'Pickup Roller Kit (Universal)', nameAr: 'طقم بكرة سحب (متعدد)', price: 145, stock: 45, categoryId: catSpare.id, brandId: bGeneric.id, soldCount: 32 },
    { slug: 'printer-cleaning-kit', sku: 'CLEAN-KIT', nameEn: 'Printer Cleaning Kit · Professional', nameAr: 'طقم تنظيف طابعات · احترافي', price: 225, stock: 40, categoryId: catSpare.id, brandId: bGeneric.id, soldCount: 28 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { stock: p.stock, price: p.price, salePrice: p.salePrice ?? null, soldCount: p.soldCount ?? 0 },
      create: { ...p, status: ProductStatus.ACTIVE, isActive: true },
    });
  }
  console.log(`   ✅ ${products.length} products`);

  // ─── 3. Users — admin + staff + 3 customers ───────────────────────
  const passwordHash = await bcrypt.hash('Demo@Pass2025!', 12);
  const adminHash = await bcrypt.hash('Admin@PrintFalcon2025!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@printbyfalcon.com' },
    update: { passwordHash: adminHash },
    create: {
      email: 'admin@printbyfalcon.com', firstName: 'Super', lastName: 'Admin',
      passwordHash: adminHash, role: Role.SUPERADMIN, isVerified: true, isActive: true,
    },
  });
  const salesMgr = await prisma.user.upsert({
    where: { email: 'sales@printbyfalcon.com' },
    update: {},
    create: { email: 'sales@printbyfalcon.com', firstName: 'Sara', lastName: 'Mansour', passwordHash, role: Role.SALES_MANAGER, isVerified: true, isActive: true, phone: '+201112223344' },
  });
  const supportAgent = await prisma.user.upsert({
    where: { email: 'support@printbyfalcon.com' },
    update: {},
    create: { email: 'support@printbyfalcon.com', firstName: 'Karim', lastName: 'Hassan', passwordHash, role: Role.CUSTOMER_SERVICE, isVerified: true, isActive: true, phone: '+201098765432' },
  });

  // Customers — use real Egyptian phone format (international, no +) for WhatsApp
  const c1 = await prisma.user.upsert({
    where: { email: 'ahmed@example.com' },
    update: {},
    create: { email: 'ahmed@example.com', firstName: 'Ahmed', lastName: 'El-Khattab', passwordHash, role: Role.CUSTOMER, phone: '+201012345678', isVerified: true, isActive: true },
  });
  const c2 = await prisma.user.upsert({
    where: { email: 'mona@example.com' },
    update: {},
    create: { email: 'mona@example.com', firstName: 'Mona', lastName: 'Farid', passwordHash, role: Role.CUSTOMER, phone: '+201123456789', isVerified: true, isActive: true },
  });
  const c3 = await prisma.user.upsert({
    where: { email: 'youssef@example.com' },
    update: {},
    create: { email: 'youssef@example.com', firstName: 'Youssef', lastName: 'Ibrahim', passwordHash, role: Role.CUSTOMER, phone: '+201234567890', isVerified: true, isActive: true },
  });
  console.log(`   ✅ 1 admin + 2 staff + 3 customers`);

  // ─── 4. Addresses — 1-2 per customer ──────────────────────────────
  await prisma.address.deleteMany({ where: { userId: { in: [c1.id, c2.id, c3.id] } } });
  const [a1, a2, a3] = await Promise.all([
    prisma.address.create({ data: { userId: c1.id, label: 'Home', fullName: 'Ahmed El-Khattab', phone: '+201012345678', street: '12 Mohamed Ezzat St., Zamalek', city: 'Cairo', state: 'Cairo', postalCode: '11211', isDefault: true } }),
    prisma.address.create({ data: { userId: c2.id, label: 'Office', fullName: 'Mona Farid', phone: '+201123456789', street: '45 Makram Ebeid, Nasr City', city: 'Cairo', state: 'Cairo', postalCode: '11765', isDefault: true } }),
    prisma.address.create({ data: { userId: c3.id, label: 'Home', fullName: 'Youssef Ibrahim', phone: '+201234567890', street: '7 Saad Zaghloul, San Stefano', city: 'Alexandria', state: 'Alexandria', postalCode: '21532', isDefault: true } }),
  ]);
  console.log(`   ✅ 3 addresses`);

  // ─── 5. Coupons — 4 variants ──────────────────────────────────────
  await prisma.coupon.deleteMany({ where: { code: { in: ['WELCOME10', 'SAVE50', 'SHIPFREE', 'EXPIRED'] } } });
  await Promise.all([
    prisma.coupon.create({ data: { code: 'WELCOME10', type: CouponType.PERCENT, value: 10, minOrderAmount: 500, maxUses: 100, perCustomerLimit: 1, isActive: true } }),
    prisma.coupon.create({ data: { code: 'SAVE50', type: CouponType.FIXED, value: 50, minOrderAmount: 300, maxUses: null, perCustomerLimit: 3, isActive: true } }),
    prisma.coupon.create({ data: { code: 'SHIPFREE', type: CouponType.FREE_SHIPPING, value: 0, minOrderAmount: 1000, perCustomerLimit: 5, isActive: true } }),
    prisma.coupon.create({ data: { code: 'EXPIRED', type: CouponType.PERCENT, value: 20, isActive: true, expiresAt: new Date(Date.now() - 86_400_000) } }),
  ]);
  console.log(`   ✅ 4 coupons (WELCOME10, SAVE50, SHIPFREE, EXPIRED)`);

  // ─── 6. Orders — 5 realistic orders with tracking + payments ──────
  const hpInk = await prisma.product.findUnique({ where: { slug: 'hp-680-black-ink' } });
  const hpColor = await prisma.product.findUnique({ where: { slug: 'hp-680-color-ink' } });
  const epsonPrinter = await prisma.product.findUnique({ where: { slug: 'epson-l3250' } });
  const paperA4 = await prisma.product.findUnique({ where: { slug: 'hp-a4-premium-500' } });
  const toner = await prisma.product.findUnique({ where: { slug: 'hp-26a-toner' } });

  // Nuke demo orders first so reseeding doesn't multiply rows
  await prisma.orderTracking.deleteMany({ where: { order: { user: { email: { in: ['ahmed@example.com', 'mona@example.com', 'youssef@example.com'] } } } } });
  await prisma.payment.deleteMany({ where: { order: { user: { email: { in: ['ahmed@example.com', 'mona@example.com', 'youssef@example.com'] } } } } });
  await prisma.orderItem.deleteMany({ where: { order: { user: { email: { in: ['ahmed@example.com', 'mona@example.com', 'youssef@example.com'] } } } } });
  await prisma.order.deleteMany({ where: { user: { email: { in: ['ahmed@example.com', 'mona@example.com', 'youssef@example.com'] } } } });

  const makeOrder = async (opts: {
    user: typeof c1;
    address: typeof a1;
    items: { product: any; qty: number }[];
    status: OrderStatus;
    method: PaymentMethod;
    paidOk: boolean;
    couponCode?: string;
    couponDiscount?: number;
    ageDays: number;
    courier?: string;
    trackingNum?: string;
  }) => {
    const subtotal = opts.items.reduce((s, it) => s + Number(it.product.salePrice ?? it.product.price) * it.qty, 0);
    const shipping = subtotal >= 1500 ? 0 : 75;
    const discount = opts.couponDiscount ?? 0;
    const total = Math.max(0, subtotal + shipping - discount);
    const createdAt = new Date(Date.now() - opts.ageDays * 86_400_000);

    const order = await prisma.order.create({
      data: {
        invoiceNumber: invoiceNumber(opts.ageDays),
        userId: opts.user.id,
        addressId: opts.address.id,
        status: opts.status,
        paymentMethod: opts.method,
        subtotal, shippingAmount: shipping, vatAmount: 0, couponDiscount: discount, totalAmount: total,
        couponCode: opts.couponCode,
        createdAt,
      },
    });

    // Items
    for (const it of opts.items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: it.product.id,
          quantity: it.qty,
          unitPrice: Number(it.product.salePrice ?? it.product.price),
          totalPrice: Number(it.product.salePrice ?? it.product.price) * it.qty,
          productSnapshot: {
            nameEn: it.product.nameEn, nameAr: it.product.nameAr,
            sku: it.product.sku,
            imageUrl: null,
            price: Number(it.product.price),
            salePrice: it.product.salePrice ? Number(it.product.salePrice) : null,
          },
        },
      });
    }

    // Payment (not for COD that's still pending)
    if (opts.method !== PaymentMethod.COD) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          method: opts.method,
          status: opts.paidOk ? PaymentStatus.SUCCESS : PaymentStatus.PENDING,
          transactionId: opts.paidOk ? `demo-tx-${Math.floor(Math.random() * 1_000_000)}` : null,
          paymobOrderId: `demo-paymob-${Math.floor(Math.random() * 1_000_000)}`,
          hmacVerified: opts.paidOk,
          paidAt: opts.paidOk ? createdAt : null,
        },
      });
    }

    // Tracking events — one per status reached
    const statusChain: OrderStatus[] = [];
    const statusOrder: OrderStatus[] = [
      OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_CONFIRMED,
      OrderStatus.PROCESSING, OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED,
    ];
    for (const st of statusOrder) {
      statusChain.push(st);
      if (st === opts.status) break;
    }
    for (let i = 0; i < statusChain.length; i++) {
      await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: statusChain[i],
          note: i === statusChain.length - 1 && opts.courier ? `Dispatched via ${opts.courier}` : null,
          courierName: i === statusChain.length - 1 ? opts.courier ?? null : null,
          trackingNumber: i === statusChain.length - 1 ? opts.trackingNum ?? null : null,
          timestamp: new Date(createdAt.getTime() + i * 3_600_000),
        },
      });
    }

    return order;
  };

  await makeOrder({ user: c1, address: a1, items: [{ product: hpInk!, qty: 2 }, { product: hpColor!, qty: 1 }], status: OrderStatus.DELIVERED, method: PaymentMethod.CARD, paidOk: true, ageDays: 15, courier: 'Aramex', trackingNum: 'ARM-2025-00112' });
  await makeOrder({ user: c1, address: a1, items: [{ product: paperA4!, qty: 3 }], status: OrderStatus.SHIPPED, method: PaymentMethod.FAWRY, paidOk: true, ageDays: 3, courier: 'Bosta', trackingNum: 'BOS-2025-44231' });
  await makeOrder({ user: c2, address: a2, items: [{ product: epsonPrinter!, qty: 1 }, { product: paperA4!, qty: 2 }], status: OrderStatus.PROCESSING, method: PaymentMethod.CARD, paidOk: true, couponCode: 'WELCOME10', couponDiscount: 533, ageDays: 1 });
  await makeOrder({ user: c2, address: a2, items: [{ product: toner!, qty: 1 }], status: OrderStatus.PENDING_PAYMENT, method: PaymentMethod.CARD, paidOk: false, ageDays: 0 });
  await makeOrder({ user: c3, address: a3, items: [{ product: hpInk!, qty: 1 }, { product: paperA4!, qty: 1 }], status: OrderStatus.CANCELLED, method: PaymentMethod.COD, paidOk: false, ageDays: 7 });
  console.log(`   ✅ 5 orders across statuses (DELIVERED, SHIPPED, PROCESSING, PENDING_PAYMENT, CANCELLED)`);

  // ─── 7. Support tickets (2 per customer) ──────────────────────────
  await prisma.ticketReply.deleteMany({ where: { ticket: { user: { email: { in: ['ahmed@example.com', 'mona@example.com'] } } } } });
  await prisma.supportTicket.deleteMany({ where: { user: { email: { in: ['ahmed@example.com', 'mona@example.com'] } } } });

  const t1 = await prisma.supportTicket.create({
    data: {
      userId: c1.id,
      subject: 'My HP 680 cartridge is not recognised',
      category: TicketCategory.TECHNICAL_SUPPORT,
      priority: TicketPriority.HIGH,
      status: TicketStatus.IN_PROGRESS,
      replies: {
        create: [
          { userId: c1.id, message: 'Hi team, I just installed the HP 680 black cartridge but my DeskJet 2335 says "cartridge missing". Help please.' },
          { userId: supportAgent.id, message: 'Hello Ahmed — please try removing the cartridge, wiping the contacts with a dry lint-free cloth, and reinserting. Let us know if the issue persists.' },
        ],
      },
    },
  });

  const t2 = await prisma.supportTicket.create({
    data: {
      userId: c2.id,
      subject: 'Invoice reprint request',
      category: TicketCategory.ORDER_ISSUE,
      priority: TicketPriority.LOW,
      status: TicketStatus.RESOLVED,
      satisfaction: 5,
      replies: {
        create: [
          { userId: c2.id, message: 'Can I get a PDF invoice for order FLN-20250414-* ?' },
          { userId: supportAgent.id, message: 'Attached. Please check your email — we sent it to mona@example.com.' },
          { userId: c2.id, message: 'Received, thank you!' },
        ],
      },
    },
  });
  console.log(`   ✅ 2 support tickets`);

  // ─── 8. Banners ───────────────────────────────────────────────────
  await prisma.banner.deleteMany({ where: { titleEn: { in: ['Genuine HP & Canon', 'Fast Egypt-wide delivery'] } } });
  await Promise.all([
    prisma.banner.create({ data: { imageUrl: 'https://images.unsplash.com/photo-1586864387789-628af9feed72?w=1600', titleEn: 'Genuine HP & Canon', titleAr: 'أصلي من HP و Canon', sortOrder: 1, isActive: true } }),
    prisma.banner.create({ data: { imageUrl: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=1600', titleEn: 'Fast Egypt-wide delivery', titleAr: 'شحن سريع لكل مصر', sortOrder: 2, isActive: true } }),
  ]);
  console.log(`   ✅ 2 banners`);

  // ─── 9. Suppliers + PO ────────────────────────────────────────────
  const sup1 = await prisma.supplier.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000001', name: 'HP Authorised Distributor — Cairo', contactEmail: 'sales@hp-distributor.eg', contactPhone: '+20225770555', address: 'Downtown Cairo', paymentTerms: 'Net 30' },
  });
  const sup2 = await prisma.supplier.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000002', name: 'Epson Regional — Alexandria', contactEmail: 'contact@epson-eg.com', contactPhone: '+20354212099', address: 'Smouha, Alexandria', paymentTerms: 'Net 15' },
  });

  // Clear prior demo POs
  await prisma.pOItem.deleteMany({ where: { purchaseOrder: { supplierId: { in: [sup1.id, sup2.id] } } } });
  await prisma.purchaseOrder.deleteMany({ where: { supplierId: { in: [sup1.id, sup2.id] } } });

  await prisma.purchaseOrder.create({
    data: {
      supplierId: sup1.id,
      status: POStatus.CONFIRMED,
      notes: 'Restock HP consumables for Q2',
      totalAmount: 145000,
      items: {
        create: [
          { productId: hpInk!.id, quantity: 200, unitCost: 145, receivedQty: 0 },
          { productId: hpColor!.id, quantity: 200, unitCost: 170, receivedQty: 0 },
          { productId: toner!.id, quantity: 50, unitCost: 1400, receivedQty: 0 },
        ],
      },
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      supplierId: sup2.id,
      status: POStatus.SENT,
      notes: 'Epson ink bottles + printer stock',
      totalAmount: 68000,
      items: {
        create: [{ productId: epsonPrinter!.id, quantity: 10, unitCost: 3800 }],
      },
    },
  });
  console.log(`   ✅ 2 suppliers + 2 purchase orders`);

  console.log('\n🎉 DEMO SEED COMPLETE!');
  console.log('\n┌─ Test accounts ─────────────────────────────────────────');
  console.log('│ SUPERADMIN  admin@printbyfalcon.com     / Admin@PrintFalcon2025!');
  console.log('│ SALES_MGR   sales@printbyfalcon.com     / Demo@Pass2025!');
  console.log('│ SUPPORT     support@printbyfalcon.com   / Demo@Pass2025!');
  console.log('│ CUSTOMER    ahmed@example.com           / Demo@Pass2025!');
  console.log('│ CUSTOMER    mona@example.com            / Demo@Pass2025!');
  console.log('│ CUSTOMER    youssef@example.com         / Demo@Pass2025!');
  console.log('└──────────────────────────────────────────────────────────');
  console.log('\n┌─ Working coupons ───────────────────────────────────────');
  console.log('│ WELCOME10   10% off · min order 500 · 1/customer');
  console.log('│ SAVE50      flat EGP 50 off · min order 300 · 3/customer');
  console.log('│ SHIPFREE    free shipping · min order 1000');
  console.log('│ EXPIRED     (for testing rejection path)');
  console.log('└──────────────────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Demo seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
