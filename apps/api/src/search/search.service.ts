import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
// @ts-ignore
import MeiliSearch from 'meilisearch';

@Injectable()
export class SearchService implements OnModuleInit {
  private client: MeiliSearch;
  private readonly INDEX_NAME = 'products';
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.client = new MeiliSearch({
      host: config.get('MEILI_HOST', 'http://meilisearch:7700'),
      apiKey: config.get('MEILI_MASTER_KEY'),
    });
  }

  // ── Initialize index settings on startup ──────────────────
  async onModuleInit() {
    try {
      const index = this.client.index(this.INDEX_NAME);

      // Searchable fields — order matters (most important first)
      await index.updateSearchableAttributes([
        'nameEn',
        'nameAr',
        'sku',
        'brandName',
        'categoryName',
        'descriptionEn',
        'descriptionAr',
      ]);

      // Filterable fields — used for sidebar filters
      await index.updateFilterableAttributes([
        'categoryId',
        'brandId',
        'price',
        'salePrice',
        'inStock',
        'hasDiscount',
        'rating',
        'status',
        'isActive',
      ]);

      // Sortable fields
      await index.updateSortableAttributes([
        'price',
        'rating',
        'soldCount',
        'createdAt',
      ]);

      // Typo tolerance — forgive mistakes in short words too
      await index.updateTypoTolerance({
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8,
        },
      });

      // Synonyms — Arabic/English equivalents
      await index.updateSynonyms({
        'حبر': ['ink', 'cartridge', 'inkjet'],
        'ink': ['حبر', 'cartridge', 'inkjet'],
        'cartridge': ['حبر', 'ink', 'خرطوشة'],
        'خرطوشة': ['cartridge', 'ink', 'حبر'],
        'طابعة': ['printer', 'printers'],
        'printer': ['طابعة', 'printers'],
        'toner': ['تونر', 'laser'],
        'تونر': ['toner', 'laser'],
        'ورق': ['paper', 'media'],
        'paper': ['ورق', 'media'],
      });

      this.logger.log('✅ Meilisearch index configured');
    } catch (error: any) {
      this.logger.warn(`⚠️ Meilisearch not available: ${error.message}`);
    }
  }

  // ── Search products ───────────────────────────────────────
  async search(params: {
    q: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    hasDiscount?: boolean;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    userId?: string;
  }) {
    const {
      q,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      inStock,
      hasDiscount,
      sort,
      order = 'desc',
      page = 1,
      limit = 20,
      userId,
    } = params;

    const filters: string[] = [
      'isActive = true',
      'status = "ACTIVE"',
    ];
    if (categoryId) filters.push(`categoryId = "${categoryId}"`);
    if (brandId) filters.push(`brandId = "${brandId}"`);
    if (inStock) filters.push('inStock = true');
    if (hasDiscount) filters.push('hasDiscount = true');
    if (minPrice !== undefined) filters.push(`price >= ${minPrice}`);
    if (maxPrice !== undefined) filters.push(`price <= ${maxPrice}`);

    const sortBy: Array<{ [key: string]: 'asc' | 'desc' }> = [];
    if (sort === 'price') sortBy.push({ price: order });
    else if (sort === 'rating') sortBy.push({ rating: order });
    else if (sort === 'soldCount') sortBy.push({ soldCount: order });
    else sortBy.push({ createdAt: order });

    try {
      const result = await this.client.index(this.INDEX_NAME).search(q, {
        filter: filters.join(' AND '),
        sort: sortBy.map(s => {
          const [key, dir] = Object.entries(s)[0];
          return `${key}:${dir}`;
        }),
        offset: (page - 1) * limit,
        limit,
        attributesToHighlight: ['nameEn', 'nameAr'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });

      // Save analytics async (don't await — fire and forget)
      this.saveSearchAnalytics(q, result.estimatedTotalHits ?? 0, userId).catch(() => {});

      return {
        data: result.hits,
        total: result.estimatedTotalHits ?? 0,
        page,
        limit,
        totalPages: Math.ceil((result.estimatedTotalHits ?? 0) / limit),
        hasNextPage: page * limit < (result.estimatedTotalHits ?? 0),
        query: q,
      };
    } catch (error: any) {
      this.logger.warn(`Meilisearch search failed, falling back to DB: ${error.message}`);
      // Fallback to PostgreSQL if Meilisearch is down
      const where: any = {
        isActive: true,
        status: 'ACTIVE',
        ...(categoryId && { categoryId }),
        ...(brandId && { brandId }),
        ...(inStock && { stock: { gt: 0 } }),
        ...(hasDiscount && { salePrice: { not: null } }),
        ...(q && {
          OR: [
            { nameEn: { contains: q, mode: 'insensitive' } },
            { nameAr: { contains: q, mode: 'insensitive' } },
          ],
        }),
      };

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          include: {
            category: { select: { nameEn: true, nameAr: true } },
            brand: { select: { nameEn: true, nameAr: true, logoUrl: true } },
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
        query: q,
      };
    }
  }

  // ── Autocomplete ──────────────────────────────────────────
  async autocomplete(q: string) {
    if (!q || q.trim().length < 2) return { suggestions: [] };

    try {
      const result = await this.client.index(this.INDEX_NAME).search(q, {
        limit: 8,
        attributesToRetrieve: ['nameEn', 'nameAr', 'slug', 'imageUrl', 'price'],
        filter: 'isActive = true AND status = "ACTIVE"',
      });

      return {
        suggestions: result.hits.map((h: any) => ({
          nameEn: h.nameEn,
          nameAr: h.nameAr,
          slug: h.slug,
          imageUrl: h.imageUrl,
          price: h.price,
        })),
      };
    } catch {
      return { suggestions: [] };
    }
  }

  // ── Index a single product ────────────────────────────────
  async indexProduct(product: any) {
    try {
      const document = this.transformProduct(product);
      await this.client.index(this.INDEX_NAME).addDocuments([document]);
    } catch (error: any) {
      this.logger.warn(`Could not index product ${product.id}: ${error.message}`);
    }
  }

  // ── Update a product in index ─────────────────────────────
  async updateProduct(product: any) {
    try {
      const document = this.transformProduct(product);
      await this.client.index(this.INDEX_NAME).updateDocuments([document]);
    } catch (error: any) {
      this.logger.warn(`Could not update product ${product.id}: ${error.message}`);
    }
  }

  // ── Delete a product from index ───────────────────────────
  async deleteProduct(productId: string) {
    try {
      await this.client.index(this.INDEX_NAME).deleteDocument(productId);
    } catch (error: any) {
      this.logger.warn(`Could not delete product ${productId}: ${error.message}`);
    }
  }

  // ── Bulk sync all products ────────────────────────────────
  async bulkSync(): Promise<{ synced: number; errors: number }> {
    let synced = 0;
    let errors = 0;
    const batchSize = 500;
    let skip = 0;

    while (true) {
      const products = await this.prisma.product.findMany({
        skip,
        take: batchSize,
        include: {
          category: { select: { nameEn: true, nameAr: true } },
          brand: { select: { nameEn: true, nameAr: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      });

      if (products.length === 0) break;

      try {
        const documents = products.map((p: any) => this.transformProduct(p));
        await this.client.index(this.INDEX_NAME).addDocuments(documents);
        synced += products.length;
      } catch {
        errors += products.length;
      }

      skip += batchSize;
      if (products.length < batchSize) break;
    }

    this.logger.log(`Bulk sync complete: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  }

  // ── Get popular search terms ──────────────────────────────
  async getPopularSearchTerms(limit: number = 20) {
    return this.prisma.searchAnalytics.groupBy({
      by: ['query'],
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit,
    });
  }

  // ── Private: transform product for Meilisearch ────────────
  private transformProduct(product: any) {
    return {
      id: product.id,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      descriptionEn: product.descriptionEn,
      descriptionAr: product.descriptionAr,
      sku: product.sku,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      hasDiscount: !!product.salePrice,
      stock: product.stock,
      inStock: product.stock > 0,
      rating: Number(product.rating),
      soldCount: product.soldCount,
      status: product.status,
      isActive: product.isActive,
      categoryId: product.categoryId,
      categoryName: product.category?.nameEn || '',
      categoryNameAr: product.category?.nameAr || '',
      brandId: product.brandId,
      brandName: product.brand?.nameEn || '',
      brandNameAr: product.brand?.nameAr || '',
      imageUrl: product.images?.[0]?.url || null,
      slug: product.slug,
      createdAt: product.createdAt
        ? new Date(product.createdAt).getTime()
        : Date.now(),
    };
  }

  // ── Private: save search analytics ───────────────────────
  private async saveSearchAnalytics(
    query: string,
    resultsCount: number,
    userId?: string,
  ) {
    if (!query || query.trim().length < 2) return;
    await this.prisma.searchAnalytics.create({
      data: {
        query: query.trim().toLowerCase(),
        resultsCount,
        userId: userId || null,
      },
    });
  }
}
