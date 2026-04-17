import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CheckoutDto } from './dto/checkout.dto';
import { PaymentMethod, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
    private notifications: NotificationsService,
  ) {}

  // ── Generate invoice number ─────────────────────────────
  generateInvoiceNumber(): string {
    const date = new Date();
    const ymd =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `FLN-${ymd}-${rand}`;
  }

  // ── Main checkout flow ──────────────────────────────────
  async checkout(
    userId: string,
    dto: CheckoutDto,
    session: Record<string, any>,
  ) {
    // 1. Get enriched cart
    const cart = await this.cartService.getCart(userId, session);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Validate stock for each item
    for (const item of cart.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.nameEn}. Available: ${product.stock}`,
        );
      }
    }

    // 3. Apply coupon if provided
    let couponDiscount = cart.couponDiscount || 0;
    let couponCode: string | null = null;

    if (dto.couponCode) {
      const couponResult = await this.cartService.validateCoupon(
        dto.couponCode,
        cart.subtotal,
      );
      if (!couponResult.valid) {
        throw new BadRequestException(couponResult.reason || 'Invalid coupon');
      }
      couponDiscount = couponResult.discount;
      couponCode = dto.couponCode.toUpperCase();
    } else if (cart.couponCode) {
      couponCode = cart.couponCode;
    }

    // 4. Calculate shipping
    const shippingAmount = dto.shippingMethod === 'EXPRESS' ? 100 : cart.shippingAmount;

    // 5. Recalculate totals
    const subtotal = cart.subtotal;
    const vatAmount = cart.vatAmount;
    const totalAmount = subtotal + vatAmount + shippingAmount - couponDiscount;

    // 6. Create order in DB (in a transaction)
    const order = await this.prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          invoiceNumber: this.generateInvoiceNumber(),
          userId,
          addressId: dto.addressId || null,
          status: OrderStatus.PENDING_PAYMENT,
          paymentMethod: dto.paymentMethod,
          subtotal,
          shippingAmount,
          vatAmount,
          couponDiscount,
          totalAmount: Math.max(totalAmount, 0),
          couponCode,
          notes: dto.notes || null,
        },
      });

      // Create order items + snapshot current product data
      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { images: { take: 1 } },
        });
        if (!product) continue;

        const unitPrice = Number(product.salePrice || product.price);
        const totalPrice = unitPrice * item.quantity;

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
            productSnapshot: {
              nameAr: product.nameAr,
              nameEn: product.nameEn,
              sku: product.sku,
              price: Number(product.price),
              salePrice: product.salePrice ? Number(product.salePrice) : null,
              image: (product as any).images?.[0]?.url || null,
            },
          },
        });

        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      // Add initial tracking event
      await tx.orderTracking.create({
        data: {
          orderId: newOrder.id,
          status: OrderStatus.PENDING_PAYMENT,
          note: 'Order placed successfully',
        },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: Math.max(totalAmount, 0),
          status: 'PENDING',
          method: dto.paymentMethod,
        },
      });

      return newOrder;
    });

    // 7. Clear cart
    await this.cartService.clearCart(userId, session);

    // 8. Handle payment based on method
    if (dto.paymentMethod === PaymentMethod.COD) {
      // COD: update order to processing immediately
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PROCESSING },
      });
      await this.prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PROCESSING,
          note: 'Cash on delivery - order confirmed',
        },
      });

      // Notify customer (fire-and-forget — don't slow down the response)
      this.prisma.order
        .findUnique({ where: { id: order.id }, include: { user: true, items: true } })
        .then((enriched) => {
          if (enriched) this.notifications.notifyOrderCreated(enriched).catch(() => {});
        })
        .catch((e) => this.logger.error('COD notification fetch failed:', e.message));

      return {
        success: true,
        orderId: order.id,
        invoiceNumber: order.invoiceNumber,
        paymentMethod: 'COD',
        message: 'Order placed successfully. Pay on delivery.',
        totalAmount: Math.max(totalAmount, 0),
      };
    }

    // 9. Initiate Paymob payment (CARD or FAWRY)
    const paymentResult = await this.paymentsService.initiatePayment(
      order.id,
      Math.max(totalAmount, 0),
      dto.paymentMethod,
      userId,
    );

    return {
      success: true,
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
      paymentMethod: dto.paymentMethod,
      totalAmount: Math.max(totalAmount, 0),
      ...paymentResult,
    };
  }

  // ── Get user orders ────────────────────────────────────
  async getUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { take: 1 } },
              },
            },
          },
          payment: true,
          tracking: { orderBy: { timestamp: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Get single order ───────────────────────────────────
  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
          },
        },
        payment: true,
        tracking: { orderBy: { timestamp: 'asc' } },
        address: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new NotFoundException('Order not found');

    return order;
  }

  // ── Admin: get all orders ───────────────────────────────
  async getAllOrders(filters: {
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, paymentMethod, dateFrom, dateTo, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Admin: update order status ──────────────────────────
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    courierName?: string,
    trackingNumber?: string,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    await this.prisma.orderTracking.create({
      data: {
        orderId,
        status,
        note: note || `Status updated to ${status}`,
        courierName: courierName || null,
        trackingNumber: trackingNumber || null,
      },
    });

    // Notify customer about status change (fire-and-forget)
    this.prisma.order
      .findUnique({ where: { id: orderId }, include: { user: true, items: true } })
      .then((enriched) => {
        if (enriched) this.notifications.notifyOrderStatusChanged(enriched, status).catch(() => {});
      })
      .catch((e) => this.logger.error('Status notification fetch failed:', e.message));

    return { success: true, message: `Order status updated to ${status}` };
  }

  // ── Restore stock on payment failure ─────────────────────
  async restoreStock(orderId: string) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId },
    });

    for (const item of orderItems) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
          soldCount: { decrement: item.quantity },
        },
      });
    }
  }
}
