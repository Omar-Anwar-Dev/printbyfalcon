import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { parseString } from '@fast-csv/parse';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { UploadService } from '../upload/upload.service';
import slugify from 'slugify';
import { Prisma, ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  // ── Create product ────────────────────────────────────────
  async create(dto: CreateProductDto) {
    const slug = slugify(dto.nameEn, { lower: true, strict: true });

    const existingSlug = await this.prisma.product.findUnique({ where: { slug } });
    if (existingSlug) throw new ConflictException('Product slug already exists');

    const existingSku = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
    if (existingSku) throw new ConflictException('SKU already exists');

    return this.prisma.product.create({
      data: { ...dto, slug },
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });
  }

  // ── Find all with filters ─────────────────────────────────
  async findAll(filter: ProductFilterDto) {
    const {
      categoryId, brandId, minPrice, maxPrice,
      inStock, hasDiscount, rating,
      sort = 'createdAt', order = 'desc',
      page = 1, limit = 20,
      search,
    } = filter;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      status: ProductStatus.ACTIVE,
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(inStock && { stock: { gt: 0 } }),
      ...(hasDiscount && { salePrice: { not: null } }),
      ...(rating && { rating: { gte: rating } }),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice && { gte: minPrice }),
              ...(maxPrice && { lte: maxPrice }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { nameEn: { contains: search, mode: 'insensitive' } },
          { nameAr: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      ...(sort === 'price' && { price: order }),
      ...(sort === 'rating' && { rating: order }),
      ...(sort === 'soldCount' && { soldCount: order }),
      ...(sort === 'createdAt' && { createdAt: order }),
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
          brand: { select: { id: true, nameAr: true, nameEn: true, slug: true, logoUrl: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + limit < total,
    };
  }

  // ── Find one by slug ──────────────────────────────────────
  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product || !product.isActive) throw new NotFoundException('Product not found');

    // Increment view count
    await this.prisma.product.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    return product;
  }

  // ── Find one by ID ────────────────────────────────────────
  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // ── Update ────────────────────────────────────────────────
  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true, brand: true, images: true },
    });
  }

  // ── Delete (soft) ─────────────────────────────────────────
  async remove(id: string) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false, status: ProductStatus.ARCHIVED },
    });
  }

  // ── Upload image ──────────────────────────────────────────
  async uploadImage(
    productId: string,
    file: Express.Multer.File,
    sortOrder: number = 0,
  ) {
    await this.findById(productId);
    const url = await this.uploadService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      `products/${productId}`,
    );

    return this.prisma.productImage.create({
      data: { productId, url, sortOrder },
    });
  }

  // ── Stock adjustment ──────────────────────────────────────
  async adjustStock(productId: string, dto: StockAdjustmentDto, adminId: string) {
    const product = await this.findById(productId);
    const newStock = product.stock + dto.delta;

    if (newStock < 0) throw new ConflictException('Stock cannot go below zero');

    const [updatedProduct] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
      this.prisma.stockAdjustment.create({
        data: {
          productId,
          adjustedById: adminId,
          delta: dto.delta,
          reason: dto.reason,
          note: dto.note,
        },
      }),
    ]);

    return updatedProduct;
  }

  // ── Get featured products ─────────────────────────────────
  async getFeatured(limit: number = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true, status: ProductStatus.ACTIVE, stock: { gt: 0 } },
      orderBy: { soldCount: 'desc' },
      take: limit,
      include: {
        brand: { select: { nameEn: true, nameAr: true, logoUrl: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });
  }

  // ── Duplicate product ─────────────────────────────────────
  async duplicate(id: string) {
    const original = await this.findById(id);
    const newSlug = slugify(`copy-of-${original.nameEn}`, { lower: true, strict: true });
    const newSku = `${original.sku}-COPY-${Date.now()}`;

    const { id: _id, createdAt: _c, updatedAt: _u, images: _i, ...data } = original as any;

    return this.prisma.product.create({
      data: {
        ...data,
        slug: newSlug,
        sku: newSku,
        nameEn: `Copy of ${original.nameEn}`,
        nameAr: `نسخة من ${original.nameAr}`,
        status: ProductStatus.DRAFT,
        soldCount: 0,
        viewCount: 0,
      },
    });
  }

  // ── Bulk CSV import ───────────────────────────────────────
  // CSV columns: nameEn,nameAr,sku,price,stock,categoryId,brandId
  async bulkImportFromCsv(buffer: Buffer): Promise<{ created: number; skipped: number; errors: string[] }> {
    const rows = await this.parseCsv(buffer);
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        if (!row.nameEn || !row.sku || !row.price) {
          errors.push(`Row skipped — missing required fields: ${JSON.stringify(row)}`);
          skipped++;
          continue;
        }

        const existingSku = await this.prisma.product.findUnique({ where: { sku: row.sku } });
        if (existingSku) {
          errors.push(`SKU already exists: ${row.sku}`);
          skipped++;
          continue;
        }

        const baseSlug = slugify(row.nameEn, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;
        while (await this.prisma.product.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter++}`;
        }

        const productData: any = {
          nameEn: row.nameEn,
          nameAr: row.nameAr || row.nameEn,
          descriptionEn: row.descriptionEn || '',
          descriptionAr: row.descriptionAr || '',
          slug,
          sku: row.sku,
          price: parseFloat(row.price),
          salePrice: row.salePrice ? parseFloat(row.salePrice) : null,
          stock: row.stock ? parseInt(row.stock, 10) : 0,
          status: ProductStatus.DRAFT,
        };
        if (row.categoryId) productData.categoryId = row.categoryId;
        if (row.brandId) productData.brandId = row.brandId;

        await this.prisma.product.create({ data: productData });
        created++;
      } catch (err: any) {
        errors.push(`Error on SKU ${row.sku}: ${err.message}`);
        skipped++;
      }
    }

    return { created, skipped, errors };
  }

  private parseCsv(buffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const rows: Record<string, string>[] = [];
      parseString(buffer.toString(), { headers: true, trim: true })
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }
}
