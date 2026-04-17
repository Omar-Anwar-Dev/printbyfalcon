import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/create-coupon.dto';
import { CouponType } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  // ── Admin CRUD ────────────────────────────────────────
  async create(dto: CreateCouponDto) {
    const code = dto.code.toUpperCase().trim();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`Coupon code ${code} already exists`);

    return this.prisma.coupon.create({
      data: {
        code,
        type: dto.type,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount ?? null,
        maxUses: dto.maxUses ?? null,
        perCustomerLimit: dto.perCustomerLimit ?? 1,
        isActive: dto.isActive ?? true,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.coupon.count(),
    ]);
    return { data: coupons, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.minOrderAmount !== undefined && { minOrderAmount: dto.minOrderAmount }),
        ...(dto.expiresAt !== undefined && { expiresAt: new Date(dto.expiresAt) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.coupon.delete({ where: { id } });
  }

  // ── Validate coupon (used by cart + standalone endpoint) ──
  async validate(
    code: string,
    cartTotal: number,
    userId?: string,
  ): Promise<{ valid: boolean; discount: number; reason?: string; coupon?: any }> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) return { valid: false, discount: 0, reason: 'Coupon not found' };
    if (!coupon.isActive) return { valid: false, discount: 0, reason: 'Coupon is inactive' };
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { valid: false, discount: 0, reason: 'Coupon has expired' };
    }
    if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
      return { valid: false, discount: 0, reason: 'Coupon usage limit reached' };
    }
    if (coupon.minOrderAmount !== null && cartTotal < Number(coupon.minOrderAmount)) {
      return {
        valid: false,
        discount: 0,
        reason: `Minimum order amount is EGP ${Number(coupon.minOrderAmount).toFixed(2)}`,
      };
    }

    // Per-customer limit check
    if (userId && coupon.perCustomerLimit > 0) {
      const usedCount = await this.prisma.order.count({
        where: { userId, couponCode: coupon.code },
      });
      if (usedCount >= coupon.perCustomerLimit) {
        return { valid: false, discount: 0, reason: 'You have already used this coupon' };
      }
    }

    let discount = 0;
    if (coupon.type === CouponType.PERCENT) {
      discount = Math.min(cartTotal * (Number(coupon.value) / 100), cartTotal);
    } else if (coupon.type === CouponType.FIXED) {
      discount = Math.min(Number(coupon.value), cartTotal);
    } else if (coupon.type === CouponType.FREE_SHIPPING) {
      discount = 0; // Handled at cart level — shipping becomes 0
    }

    return { valid: true, discount: Math.round(discount * 100) / 100, coupon };
  }

  // ── Flash sale: set salePrice on multiple products ────
  async applyFlashSale(productIds: string[], salePrice: number) {
    if (!productIds.length) throw new BadRequestException('No products provided');

    const updated = await this.prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { salePrice },
    });
    return { updated: updated.count, message: `Flash sale applied to ${updated.count} products` };
  }

  // ── End flash sale: clear salePrice ──────────────────
  async endFlashSale(productIds: string[]) {
    if (!productIds.length) throw new BadRequestException('No products provided');
    const updated = await this.prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { salePrice: null },
    });
    return { updated: updated.count, message: `Flash sale ended for ${updated.count} products` };
  }
}
