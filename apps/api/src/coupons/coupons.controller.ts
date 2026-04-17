import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Request, UseGuards,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto, FlashSaleDto } from './dto/create-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

// ── Public / Customer ──────────────────────────────────
@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  // POST /api/v1/coupons/validate — check coupon validity before checkout
  @Post('validate')
  @UseGuards(OptionalJwtAuthGuard)
  validate(@Body() dto: ValidateCouponDto, @Request() req: any) {
    const userId = req.user?.sub;
    return this.couponsService.validate(dto.code, dto.cartTotal, userId);
  }
}

// ── Admin ──────────────────────────────────────────────
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN', 'SALES_MANAGER')
export class AdminCouponsController {
  constructor(private couponsService: CouponsService) {}

  @Post('coupons')
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Get('coupons')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.couponsService.findAll(page, limit);
  }

  @Get('coupons/:id')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Patch('coupons/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete('coupons/:id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }

  // POST /api/v1/admin/promotions/flash-sale
  @Post('promotions/flash-sale')
  applyFlashSale(@Body() dto: FlashSaleDto) {
    return this.couponsService.applyFlashSale(dto.productIds, dto.salePrice);
  }

  // DELETE /api/v1/admin/promotions/flash-sale
  @Delete('promotions/flash-sale')
  endFlashSale(@Body() dto: { productIds: string[] }) {
    return this.couponsService.endFlashSale(dto.productIds);
  }
}
