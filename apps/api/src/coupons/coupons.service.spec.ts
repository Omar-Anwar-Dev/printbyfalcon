import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { PrismaService } from '../prisma/prisma.service';
import { CouponType } from '@prisma/client';

describe('CouponsService.validate', () => {
  let service: CouponsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      coupon: { findUnique: jest.fn() },
      order: { count: jest.fn().mockResolvedValue(0) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  it('rejects unknown coupons', async () => {
    prisma.coupon.findUnique.mockResolvedValue(null);
    const result = await service.validate('NOPE', 500);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/not found/i);
  });

  it('rejects inactive coupons', async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      code: 'SAVE10', isActive: false, type: CouponType.PERCENT, value: 10, usesCount: 0, maxUses: null, minOrderAmount: null, perCustomerLimit: 0, expiresAt: null,
    });
    const result = await service.validate('SAVE10', 500);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/inactive/i);
  });

  it('rejects expired coupons', async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      code: 'SAVE10', isActive: true, type: CouponType.PERCENT, value: 10,
      usesCount: 0, maxUses: null, minOrderAmount: null, perCustomerLimit: 0,
      expiresAt: new Date(Date.now() - 86_400_000),
    });
    const result = await service.validate('SAVE10', 500);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/expired/i);
  });

  it('rejects when usage limit reached', async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      code: 'SAVE10', isActive: true, type: CouponType.PERCENT, value: 10,
      usesCount: 5, maxUses: 5, minOrderAmount: null, perCustomerLimit: 0, expiresAt: null,
    });
    const result = await service.validate('SAVE10', 500);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/limit reached/i);
  });

  it('rejects when cart is below minimum', async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      code: 'SAVE10', isActive: true, type: CouponType.PERCENT, value: 10,
      usesCount: 0, maxUses: null, minOrderAmount: 1000, perCustomerLimit: 0, expiresAt: null,
    });
    const result = await service.validate('SAVE10', 500);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/minimum/i);
  });

  it('computes PERCENT discount correctly', async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      code: 'SAVE10', isActive: true, type: CouponType.PERCENT, value: 10,
      usesCount: 0, maxUses: null, minOrderAmount: null, perCustomerLimit: 0, expiresAt: null,
    });
    const result = await service.validate('SAVE10', 500);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(50);
  });

  it('computes FIXED discount and caps at cart total', async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      code: 'SAVE50', isActive: true, type: CouponType.FIXED, value: 100,
      usesCount: 0, maxUses: null, minOrderAmount: null, perCustomerLimit: 0, expiresAt: null,
    });
    const result = await service.validate('SAVE50', 80);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(80); // capped at cart total
  });

  it('enforces per-customer limit', async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      code: 'WELCOME', isActive: true, type: CouponType.PERCENT, value: 20,
      usesCount: 0, maxUses: null, minOrderAmount: null, perCustomerLimit: 1, expiresAt: null,
    });
    prisma.order.count.mockResolvedValue(1); // user already used it once
    const result = await service.validate('WELCOME', 500, 'user-123');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/already used/i);
  });

  it('normalises code (uppercase + trim)', async () => {
    prisma.coupon.findUnique.mockResolvedValue({
      code: 'SAVE10', isActive: true, type: CouponType.PERCENT, value: 10,
      usesCount: 0, maxUses: null, minOrderAmount: null, perCustomerLimit: 0, expiresAt: null,
    });
    await service.validate('  save10  ', 500);
    expect(prisma.coupon.findUnique).toHaveBeenCalledWith({ where: { code: 'SAVE10' } });
  });
});
