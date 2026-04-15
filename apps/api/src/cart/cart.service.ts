import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GuestCartItem {
  productId: string;
  quantity: number;
}

interface GuestCart {
  items: GuestCartItem[];
  couponCode?: string | null;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // ───────────────────────────────────────────────────────────────────────────
  //  GUEST CART HELPERS  (stored in Redis via express-session)
  // ───────────────────────────────────────────────────────────────────────────

  private getGuestCart(session: Record<string, any>): GuestCart {
    if (!session.cart) {
      session.cart = { items: [], couponCode: null };
    }
    return session.cart as GuestCart;
  }

  private saveGuestCart(session: Record<string, any>, cart: GuestCart) {
    session.cart = cart;
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  GET CART  — returns enriched cart with product details + calculated totals
  // ───────────────────────────────────────────────────────────────────────────

  async getCart(userId: string | null, session: Record<string, any>) {
    if (userId) {
      return this.getUserCart(userId);
    }
    return this.enrichGuestCart(session);
  }

  private async getUserCart(userId: string) {
    // Find or create the user's cart record
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { take: 1 } },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { take: 1 } },
              },
            },
          },
        },
      });
    }

    return this.calculateCartTotals(cart.items, cart.couponCode);
  }

  private async enrichGuestCart(session: Record<string, any>) {
    const guestCart = this.getGuestCart(session);
    if (guestCart.items.length === 0) {
      return this.calculateCartTotals([], null);
    }

    // Fetch product details for each item in the guest cart
    const productIds = guestCart.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { images: { take: 1 } },
    });

    // Merge quantity from guest cart with live product data
    const enrichedItems = guestCart.items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return { product, quantity: item.quantity };
      })
      .filter(Boolean);

    return this.calculateCartTotals(enrichedItems, guestCart.couponCode ?? null);
  }

  private async calculateCartTotals(
    items: any[],
    couponCode: string | null,
  ) {
    let subtotal = 0;
    const enrichedItems = items.map((item) => {
      const product = item.product;
      const price = Number(product.salePrice || product.price);
      const lineTotal = price * item.quantity;
      subtotal += lineTotal;
      return {
        productId: product.id,
        name: product.nameAr,
        nameEn: product.nameEn,
        sku: product.sku,
        image: product.images?.[0]?.url || null,
        price,
        quantity: item.quantity,
        lineTotal,
        stock: product.stock,
        inStock: product.stock > 0,
      };
    });

    // VAT = 14% (Egyptian standard VAT rate)
    const vatRate = 0.14;
    const vatAmount = subtotal * vatRate;
    const shippingAmount = subtotal > 500 ? 0 : 50; // Free shipping over 500 EGP

    // Coupon discount
    let couponDiscount = 0;
    let couponDetails = null;
    if (couponCode) {
      const result = await this.validateCoupon(couponCode, subtotal);
      if (result.valid) {
        couponDiscount = result.discount;
        couponDetails = result.coupon;
      }
    }

    const total = subtotal + vatAmount + shippingAmount - couponDiscount;

    return {
      items: enrichedItems,
      itemCount: enrichedItems.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: Math.round(subtotal * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      shippingAmount,
      couponDiscount: Math.round(couponDiscount * 100) / 100,
      couponCode: couponDetails ? couponCode : null,
      total: Math.round(total * 100) / 100,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  ADD ITEM
  // ───────────────────────────────────────────────────────────────────────────

  async addItem(
    userId: string | null,
    productId: string,
    quantity: number,
    session: Record<string, any>,
  ) {
    // Always validate product exists and has stock
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Only ${product.stock} units available in stock`,
      );
    }

    if (userId) {
      return this.addItemToUserCart(userId, productId, quantity);
    }
    return this.addItemToGuestCart(session, productId, quantity, product.stock);
  }

  private async addItemToUserCart(
    userId: string,
    productId: string,
    quantity: number,
  ) {
    // Get or create cart
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // Check if item already in cart
    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    return this.getUserCart(userId);
  }

  private addItemToGuestCart(
    session: Record<string, any>,
    productId: string,
    quantity: number,
    stock: number,
  ) {
    const cart = this.getGuestCart(session);
    const existing = cart.items.find((i) => i.productId === productId);

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > stock) {
        throw new BadRequestException(`Only ${stock} units available`);
      }
      existing.quantity = newQty;
    } else {
      cart.items.push({ productId, quantity });
    }

    this.saveGuestCart(session, cart);
    return this.enrichGuestCart(session);
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  UPDATE ITEM QUANTITY
  // ───────────────────────────────────────────────────────────────────────────

  async updateItem(
    userId: string | null,
    productId: string,
    quantity: number,
    session: Record<string, any>,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Only ${product.stock} units available`,
      );
    }

    if (userId) {
      const cart = await this.prisma.cart.findUnique({ where: { userId } });
      if (!cart) throw new NotFoundException('Cart not found');
      await this.prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { quantity },
      });
      return this.getUserCart(userId);
    }

    const cart = this.getGuestCart(session);
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) throw new NotFoundException('Item not in cart');
    item.quantity = quantity;
    this.saveGuestCart(session, cart);
    return this.enrichGuestCart(session);
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  REMOVE ITEM
  // ───────────────────────────────────────────────────────────────────────────

  async removeItem(
    userId: string | null,
    productId: string,
    session: Record<string, any>,
  ) {
    if (userId) {
      const cart = await this.prisma.cart.findUnique({ where: { userId } });
      if (cart) {
        await this.prisma.cartItem.deleteMany({
          where: { cartId: cart.id, productId },
        });
      }
      return this.getUserCart(userId);
    }

    const cart = this.getGuestCart(session);
    cart.items = cart.items.filter((i) => i.productId !== productId);
    this.saveGuestCart(session, cart);
    return this.enrichGuestCart(session);
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  CLEAR CART
  // ───────────────────────────────────────────────────────────────────────────

  async clearCart(userId: string | null, session: Record<string, any>) {
    if (userId) {
      const cart = await this.prisma.cart.findUnique({ where: { userId } });
      if (cart) {
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        await this.prisma.cart.update({
          where: { id: cart.id },
          data: { couponCode: null },
        });
      }
      return { success: true, message: 'Cart cleared' };
    }

    this.saveGuestCart(session, { items: [], couponCode: null });
    return { success: true, message: 'Cart cleared' };
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  CART COUNT  (for badge in navbar — fast lookup)
  // ───────────────────────────────────────────────────────────────────────────

  async getCount(userId: string | null, session: Record<string, any>) {
    if (userId) {
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });
      const count =
        cart?.items.reduce((sum: number, i: any) => sum + i.quantity, 0) ?? 0;
      return { count };
    }

    const cart = this.getGuestCart(session);
    const count = cart.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
    return { count };
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  MERGE CART  — called on login: move guest cart items into user DB cart
  // ───────────────────────────────────────────────────────────────────────────

  async mergeGuestCartOnLogin(
    userId: string,
    session: Record<string, any>,
  ) {
    const guestCart = this.getGuestCart(session);
    if (guestCart.items.length === 0) return;

    for (const item of guestCart.items) {
      try {
        await this.addItemToUserCart(userId, item.productId, item.quantity);
      } catch {
        // Skip items that are out of stock — don't block login
      }
    }

    // Clear guest cart after merge
    this.saveGuestCart(session, { items: [], couponCode: null });
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  COUPON
  // ───────────────────────────────────────────────────────────────────────────

  async validateCoupon(code: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) return { valid: false, reason: 'Coupon not found', discount: 0, coupon: null };
    if (!coupon.isActive) return { valid: false, reason: 'Coupon is inactive', discount: 0, coupon: null };
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { valid: false, reason: 'Coupon has expired', discount: 0, coupon: null };
    }
    if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
      return { valid: false, reason: 'Coupon usage limit reached', discount: 0, coupon: null };
    }
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      return {
        valid: false,
        reason: `Minimum order amount is ${coupon.minOrderAmount} EGP`,
        discount: 0,
        coupon: null,
      };
    }

    let discount = 0;
    if (coupon.type === 'PERCENT') {
      discount = (subtotal * Number(coupon.value)) / 100;
    } else if (coupon.type === 'FIXED') {
      discount = Math.min(Number(coupon.value), subtotal);
    } else if (coupon.type === 'FREE_SHIPPING') {
      discount = subtotal > 500 ? 0 : 50; // shipping cost
    }

    return { valid: true, discount, coupon };
  }

  async applyCoupon(
    userId: string | null,
    couponCode: string,
    session: Record<string, any>,
  ) {
    // Get current subtotal
    const cartData = await this.getCart(userId, session);
    const result = await this.validateCoupon(couponCode, cartData.subtotal);

    if (!result.valid) {
      throw new BadRequestException(result.reason);
    }

    if (userId) {
      const cart = await this.prisma.cart.findUnique({ where: { userId } });
      if (cart) {
        await this.prisma.cart.update({
          where: { id: cart.id },
          data: { couponCode: couponCode.toUpperCase() },
        });
      }
    } else {
      const cart = this.getGuestCart(session);
      cart.couponCode = couponCode.toUpperCase();
      this.saveGuestCart(session, cart);
    }

    return this.getCart(userId, session);
  }

  async removeCoupon(userId: string | null, session: Record<string, any>) {
    if (userId) {
      const cart = await this.prisma.cart.findUnique({ where: { userId } });
      if (cart) {
        await this.prisma.cart.update({
          where: { id: cart.id },
          data: { couponCode: null },
        });
      }
    } else {
      const cart = this.getGuestCart(session);
      cart.couponCode = null;
      this.saveGuestCart(session, cart);
    }
    return this.getCart(userId, session);
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  SAVE FOR LATER  — moves cart item to wishlist
  // ───────────────────────────────────────────────────────────────────────────

  async saveForLater(userId: string, productId: string) {
    // Add to wishlist
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!existing) {
      await this.prisma.wishlistItem.create({ data: { userId, productId } });
    }

    // Remove from cart
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
    }

    return { success: true, message: 'Item saved for later' };
  }
}
