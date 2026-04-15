import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsUUID } from 'class-validator';

class AddToWishlistDto {
  @IsUUID()
  productId: string;
}

@UseGuards(JwtAuthGuard)   // All wishlist routes require login
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // GET /api/v1/wishlist
  @Get()
  getWishlist(@Request() req: any) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  // POST /api/v1/wishlist
  @Post()
  addToWishlist(@Request() req: any, @Body() dto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(req.user.id, dto.productId);
  }

  // DELETE /api/v1/wishlist/:productId
  @HttpCode(HttpStatus.OK)
  @Delete(':productId')
  removeFromWishlist(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.id, productId);
  }

  // POST /api/v1/wishlist/:productId/move-to-cart
  @HttpCode(HttpStatus.OK)
  @Post(':productId/move-to-cart')
  moveToCart(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistService.moveToCart(req.user.id, productId);
  }
}
