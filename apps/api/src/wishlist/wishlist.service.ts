import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  // GET /wishlist — get all wishlisted items for a user
  async getWishlist(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { images: { take: 1 }, category: true, brand: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: items.map((item: any) => ({
        productId: item.productId,
        addedAt: item.createdAt,
        product: {
          id: item.product.id,
          nameAr: item.product.nameAr,
          nameEn: item.product.nameEn,
          slug: item.product.slug,
          price: item.product.price,
          salePrice: item.product.salePrice,
          image: item.product.images?.[0]?.url || null,
          inStock: item.product.stock > 0,
          stock: item.product.stock,
          category: item.product.category?.nameAr,
          brand: item.product.brand?.name,
        },
      })),
      count: items.length,
    };
  }

  // POST /wishlist — add product to wishlist
  async addToWishlist(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Upsert — safe to call even if already wishlisted
    await this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });

    return { success: true, message: 'Added to wishlist' };
  }

  // DELETE /wishlist/:productId — remove from wishlist
  async removeFromWishlist(userId: string, productId: string) {
    await this.prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });
    return { success: true, message: 'Removed from wishlist' };
  }

  // POST /wishlist/:productId/move-to-cart — move wishlist item to cart
  async moveToCart(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Remove from wishlist
    await this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });

    // Add to cart (quantity 1)
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { quantity: existing.quantity + 1 },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: 1 },
      });
    }

    return { success: true, message: 'Moved to cart' };
  }

  // Check if a product is wishlisted by a user (used on product pages)
  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!item;
  }
}
