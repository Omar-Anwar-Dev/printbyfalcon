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

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Request() req: any) {
    return this.wishlistService.getWishlist(req.user.sub);
  }

  @Post()
  addToWishlist(@Request() req: any, @Body() dto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(req.user.sub, dto.productId);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':productId')
  removeFromWishlist(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.sub, productId);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':productId/move-to-cart')
  moveToCart(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistService.moveToCart(req.user.sub, productId);
  }
}
