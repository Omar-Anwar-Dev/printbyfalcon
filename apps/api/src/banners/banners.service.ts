import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/create-banner.dto';
import { CacheService } from '../common/cache/cache.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService, private cache: CacheService) {}

  private async invalidate() {
    await this.cache.del('banners:*');
  }

  // Public: active banners within date range (cached 5 min)
  async findActive() {
    return this.cache.remember('banners:active', 300, () => {
      const now = new Date();
      return this.prisma.banner.findMany({
        where: {
          isActive: true,
          OR: [
            { startsAt: null, endsAt: null },
            { startsAt: { lte: now }, endsAt: null },
            { startsAt: null, endsAt: { gte: now } },
            { startsAt: { lte: now }, endsAt: { gte: now } },
          ],
        },
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  // Admin CRUD
  async create(dto: CreateBannerDto) {
    const banner = await this.prisma.banner.create({
      data: {
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        titleAr: dto.titleAr,
        titleEn: dto.titleEn,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });
    await this.invalidate();
    return banner;
  }

  async findAll() {
    return this.prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    const updated = await this.prisma.banner.update({
      where: { id },
      data: {
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.linkUrl !== undefined && { linkUrl: dto.linkUrl }),
        ...(dto.titleAr !== undefined && { titleAr: dto.titleAr }),
        ...(dto.titleEn !== undefined && { titleEn: dto.titleEn }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.startsAt !== undefined && { startsAt: dto.startsAt ? new Date(dto.startsAt) : null }),
        ...(dto.endsAt !== undefined && { endsAt: dto.endsAt ? new Date(dto.endsAt) : null }),
      },
    });
    await this.invalidate();
    return updated;
  }

  async remove(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    const result = await this.prisma.banner.delete({ where: { id } });
    await this.invalidate();
    return result;
  }
}
