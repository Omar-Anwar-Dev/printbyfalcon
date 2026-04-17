import { Injectable } from '@nestjs/common';
import { Order, OrderItem, User, OrderStatus } from '@prisma/client';
import { WhatsAppService } from './whatsapp/whatsapp.service';
import { EmailService } from './email/email.service';

type EnrichedOrder = Order & {
  user?: User | null;
  items: OrderItem[];
};

@Injectable()
export class NotificationsService {
  constructor(
    private whatsapp: WhatsAppService,
    private email: EmailService,
  ) {}

  async notifyOrderCreated(order: EnrichedOrder) {
    const { name, phone, userEmail } = this.extractUserInfo(order);

    if (phone) {
      await this.whatsapp.sendOrderConfirmation(phone, {
        customerName: name,
        invoiceNumber: order.invoiceNumber,
        total: Number(order.totalAmount),
        estimatedDelivery: '3-5 business days',
        trackingUrl: `https://printbyfalcon.com/orders/${order.id}`,
      });
    }

    if (userEmail) {
      await this.email.sendOrderConfirmation(userEmail, {
        customerName: name,
        invoiceNumber: order.invoiceNumber,
        items: order.items.map((i) => ({
          name: (i.productSnapshot as any)?.nameEn || 'Product',
          quantity: i.quantity,
          price: Number(i.unitPrice),
        })),
        total: Number(order.totalAmount),
        address: 'See your account for delivery details',
        paymentMethod: order.paymentMethod,
      });
    }
  }

  async notifyOrderStatusChanged(order: EnrichedOrder, newStatus: OrderStatus) {
    const { name, phone, userEmail } = this.extractUserInfo(order);
    const statusMessages: Partial<Record<OrderStatus, string>> = {
      PAYMENT_CONFIRMED: 'Your payment has been confirmed and your order is being prepared.',
      PROCESSING: 'Your order is being processed.',
      SHIPPED: "Your order has been shipped! It's on its way to you.",
      OUT_FOR_DELIVERY: 'Your order is out for delivery today!',
      DELIVERED: 'Your order has been delivered. Enjoy your purchase!',
      CANCELLED: 'Your order has been cancelled. Contact us if you need help.',
      REFUNDED: 'Your refund has been processed.',
    };
    const message = statusMessages[newStatus] ?? `Status updated to ${newStatus}.`;

    if (phone) {
      await this.whatsapp.sendOrderStatusUpdate(phone, {
        customerName: name,
        invoiceNumber: order.invoiceNumber,
        status: newStatus,
        message,
      });
    }

    if (userEmail) {
      await this.email.sendOrderStatusUpdate(userEmail, {
        customerName: name,
        invoiceNumber: order.invoiceNumber,
        status: newStatus,
        message,
      });
    }
  }

  async notifyPaymentConfirmed(order: EnrichedOrder) {
    const { name, phone, userEmail } = this.extractUserInfo(order);

    if (phone) {
      await this.whatsapp.sendPaymentConfirmed(phone, {
        customerName: name,
        amount: Number(order.totalAmount),
        invoiceNumber: order.invoiceNumber,
      });
    }

    if (userEmail) {
      await this.email.sendPaymentConfirmed(userEmail, {
        customerName: name,
        amount: Number(order.totalAmount),
        invoiceNumber: order.invoiceNumber,
      });
    }
  }

  private extractUserInfo(order: EnrichedOrder) {
    return {
      name: order.user
        ? `${order.user.firstName} ${order.user.lastName}`
        : 'Customer',
      phone: order.user?.phone ?? null,
      userEmail: order.user?.email ?? null,
    };
  }
}
