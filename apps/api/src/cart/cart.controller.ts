import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Session,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, ApplyCouponDto } from './cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  // GET /api/v1/cart
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  getCart(@Request() req: any, @Session() session: Record<string, any>) {
    return this.cartService.getCart(req.user?.sub ?? null, session);
  }

  // GET /api/v1/cart/count
  @UseGuards(OptionalJwtAuthGuard)
  @Get('count')
  getCount(@Request() req: any, @Session() session: Record<string, any>) {
    return this.cartService.getCount(req.user?.sub ?? null, session);
  }

  // POST /api/v1/cart/items
  @UseGuards(OptionalJwtAuthGuard)
  @Post('items')
  addItem(
    @Request() req: any,
    @Session() session: Record<string, any>,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(
      req.user?.sub ?? null,
      dto.productId,
      dto.quantity,
      session,
    );
  }

  // PATCH /api/v1/cart/items/:productId
  @UseGuards(OptionalJwtAuthGuard)
  @Patch('items/:productId')
  updateItem(
    @Request() req: any,
    @Session() session: Record<string, any>,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(
      req.user?.sub ?? null,
      productId,
      dto.quantity,
      session,
    );
  }

  // DELETE /api/v1/cart/items/:productId
  @UseGuards(OptionalJwtAuthGuard)
  @Delete('items/:productId')
  removeItem(
    @Request() req: any,
    @Session() session: Record<string, any>,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(
      req.user?.sub ?? null,
      productId,
      session,
    );
  }

  // DELETE /api/v1/cart
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete()
  clearCart(@Request() req: any, @Session() session: Record<string, any>) {
    return this.cartService.clearCart(req.user?.sub ?? null, session);
  }

  // POST /api/v1/cart/apply-coupon
  @UseGuards(OptionalJwtAuthGuard)
  @Post('apply-coupon')
  applyCoupon(
    @Request() req: any,
    @Session() session: Record<string, any>,
    @Body() dto: ApplyCouponDto,
  ) {
    return this.cartService.applyCoupon(
      req.user?.sub ?? null,
      dto.couponCode,
      session,
    );
  }

  // POST /api/v1/cart/remove-coupon
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('remove-coupon')
  removeCoupon(@Request() req: any, @Session() session: Record<string, any>) {
    return this.cartService.removeCoupon(req.user?.sub ?? null, session);
  }

  // POST /api/v1/cart/save-for-later/:productId
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('save-for-later/:productId')
  saveForLater(@Request() req: any, @Param('productId') productId: string) {
    return this.cartService.saveForLater(req.user.sub, productId);
  }
}
