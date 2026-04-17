import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CacheService } from '../common/cache/cache.service';
import slugify from 'slugify';

const CACHE_KEY_ALL = 'categories:all';
const CACHE_TTL = 3600; // 1 hour

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService, private cache: CacheService) {}

  private async invalidate() {
    await this.cache.del('categories:*');
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.nameEn, { lower: true, strict: true });
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Category slug already exists');

    const category = await this.prisma.category.create({
      data: { ...dto, slug },
      include: { parent: true, children: true },
    });
    await this.invalidate();
    return category;
  }

  async findAll() {
    return this.cache.remember(CACHE_KEY_ALL, CACHE_TTL, () =>
      this.prisma.category.findMany({
        where: { isActive: true, parentId: null },
        include: { children: { where: { isActive: true } } },
        orderBy: { sortOrder: 'asc' },
      }),
    );
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: { where: { isActive: true } } },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
      include: { parent: true, children: true },
    });
    await this.invalidate();
    return category;
  }

  async remove(id: string) {
    await this.findOne(id);
    const result = await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
    await this.invalidate();
    return result;
  }

  async reorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      this.prisma.category.update({
        where: { id },
        data: { sortOrder: index },
      }),
    );
    await this.prisma.$transaction(updates);
    await this.invalidate();
    return { message: 'Categories reordered successfully' };
  }
}
