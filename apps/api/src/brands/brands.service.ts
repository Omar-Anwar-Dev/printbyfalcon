import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CacheService } from '../common/cache/cache.service';
import slugify from 'slugify';

const CACHE_TTL = 3600; // 1h

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService, private cache: CacheService) {}

  private async invalidate() {
    await this.cache.del('brands:*');
  }

  async create(dto: CreateBrandDto) {
    const slug = slugify(dto.nameEn, { lower: true, strict: true });
    const existing = await this.prisma.brand.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Brand already exists');

    const brand = await this.prisma.brand.create({ data: { ...dto, slug } });
    await this.invalidate();
    return brand;
  }

  async findAll(featuredOnly?: boolean) {
    const key = `brands:${featuredOnly ? 'featured' : 'all'}`;
    return this.cache.remember(key, CACHE_TTL, () =>
      this.prisma.brand.findMany({
        where: {
          isActive: true,
          ...(featuredOnly ? { isFeatured: true } : {}),
        },
        include: { _count: { select: { products: true } } },
        orderBy: { nameEn: 'asc' },
      }),
    );
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({ where: { slug } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);
    const brand = await this.prisma.brand.update({ where: { id }, data: dto });
    await this.invalidate();
    return brand;
  }

  async toggleFeatured(id: string) {
    const brand = await this.findOne(id);
    const updated = await this.prisma.brand.update({
      where: { id },
      data: { isFeatured: !brand.isFeatured },
    });
    await this.invalidate();
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    const result = await this.prisma.brand.update({
      where: { id },
      data: { isActive: false },
    });
    await this.invalidate();
    return result;
  }
}
