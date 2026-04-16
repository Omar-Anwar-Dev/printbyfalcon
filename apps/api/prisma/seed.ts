import { PrismaClient, Role, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://falcon:falconpass@localhost:5432/printbyfalcon' });
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Categories ─────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'printers' },
      update: {},
      create: { nameAr: 'طابعات', nameEn: 'Printers', slug: 'printers', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'ink-cartridges' },
      update: {},
      create: { nameAr: 'خراطيش حبر', nameEn: 'Ink Cartridges', slug: 'ink-cartridges', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'toner' },
      update: {},
      create: { nameAr: 'خراطيش تونر', nameEn: 'Toner Cartridges', slug: 'toner', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'paper-media' },
      update: {},
      create: { nameAr: 'ورق ووسائط طباعة', nameEn: 'Paper & Media', slug: 'paper-media', sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'spare-parts' },
      update: {},
      create: { nameAr: 'قطع غيار', nameEn: 'Spare Parts', slug: 'spare-parts', sortOrder: 5 },
    }),
  ]);
  console.log(`✅ ${categories.length} categories seeded`);

  // ── Brands ─────────────────────────────────────────────
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'hp' },
      update: {},
      create: { nameEn: 'HP', nameAr: 'اتش بي', slug: 'hp', country: 'USA', isFeatured: true },
    }),
    prisma.brand.upsert({
      where: { slug: 'canon' },
      update: {},
      create: { nameEn: 'Canon', nameAr: 'كانون', slug: 'canon', country: 'Japan', isFeatured: true },
    }),
    prisma.brand.upsert({
      where: { slug: 'epson' },
      update: {},
      create: { nameEn: 'Epson', nameAr: 'ابسون', slug: 'epson', country: 'Japan', isFeatured: true },
    }),
    prisma.brand.upsert({
      where: { slug: 'brother' },
      update: {},
      create: { nameEn: 'Brother', nameAr: 'براذر', slug: 'brother', country: 'Japan', isFeatured: true },
    }),
    prisma.brand.upsert({
      where: { slug: 'lexmark' },
      update: {},
      create: { nameEn: 'Lexmark', nameAr: 'ليكسمارك', slug: 'lexmark', country: 'USA' },
    }),
  ]);
  console.log(`✅ ${brands.length} brands seeded`);

  // ── Super Admin User ───────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@PrintFalcon2025!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@printbyfalcon.com' },
    update: {},
    create: {
      email: 'admin@printbyfalcon.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: adminPassword,
      role: Role.SUPERADMIN,
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

  // ── Sample Products ────────────────────────────────────
  const hpBrand = brands.find(b => b.slug === 'hp')!;
  const canonBrand = brands.find(b => b.slug === 'canon')!;
  const epsonBrand = brands.find(b => b.slug === 'epson')!;
  const inkCategory = categories.find(c => c.slug === 'ink-cartridges')!;
  const printerCategory = categories.find(c => c.slug === 'printers')!;
  const tonerCategory = categories.find(c => c.slug === 'toner')!;

  const products = [
    {
      nameAr: 'خرطوشة حبر HP 680 أسود',
      nameEn: 'HP 680 Black Ink Cartridge',
      slug: 'hp-680-black-ink',
      sku: 'HP-680-BK',
      price: 299,
      stock: 50,
      categoryId: inkCategory.id,
      brandId: hpBrand.id,
      status: ProductStatus.ACTIVE,
    },
    {
      nameAr: 'خرطوشة حبر HP 680 ملونة',
      nameEn: 'HP 680 Color Ink Cartridge',
      slug: 'hp-680-color-ink',
      sku: 'HP-680-CL',
      price: 349,
      stock: 40,
      categoryId: inkCategory.id,
      brandId: hpBrand.id,
      status: ProductStatus.ACTIVE,
    },
    {
      nameAr: 'طابعة HP DeskJet 2335',
      nameEn: 'HP DeskJet 2335 Printer',
      slug: 'hp-deskjet-2335',
      sku: 'HP-DJ-2335',
      price: 1899,
      stock: 15,
      categoryId: printerCategory.id,
      brandId: hpBrand.id,
      status: ProductStatus.ACTIVE,
    },
    {
      nameAr: 'خرطوشة حبر Canon PG-745 أسود',
      nameEn: 'Canon PG-745 Black Ink Cartridge',
      slug: 'canon-pg-745-black',
      sku: 'CN-PG745-BK',
      price: 275,
      stock: 35,
      categoryId: inkCategory.id,
      brandId: canonBrand.id,
      status: ProductStatus.ACTIVE,
    },
    {
      nameAr: 'طابعة Epson L3250 متعددة الوظائف',
      nameEn: 'Epson L3250 Multifunction Printer',
      slug: 'epson-l3250',
      sku: 'EP-L3250',
      price: 5499,
      salePrice: 4999,
      stock: 8,
      categoryId: printerCategory.id,
      brandId: epsonBrand.id,
      status: ProductStatus.ACTIVE,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log(`✅ ${products.length} products seeded`);

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
