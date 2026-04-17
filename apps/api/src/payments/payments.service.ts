import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentMethod, OrderStatus, PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly PAYMOB_BASE = 'https://accept.paymob.com/api';

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    private notifications: NotificationsService,
  ) {}

  // ── Step 1: Get Paymob auth token ─────────────────────
  private async getPaymobToken(): Promise<string> {
    const apiKey = this.config.get<string>('PAYMOB_API_KEY');
    if (!apiKey || apiKey === 'your_paymob_api_key_here') {
      throw new BadRequestException('Paymob API key not configured');
    }

    const response = await axios.post(`${this.PAYMOB_BASE}/auth/tokens`, {
      api_key: apiKey,
    });
    return response.data.token;
  }

  // ── Step 2: Register order with Paymob ────────────────
  private async registerPaymobOrder(
    token: string,
    amountCents: number,
    items: any[],
  ): Promise<{ paymobOrderId: number }> {
    const response = await axios.post(
      `${this.PAYMOB_BASE}/ecommerce/orders`,
      {
        auth_token: token,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: 'EGP',
        items,
      },
    );
    return { paymobOrderId: response.data.id };
  }

  // ── Step 3: Get payment key ───────────────────────────
  private async getPaymentKey(
    token: string,
    paymobOrderId: number,
    amountCents: number,
    integrationId: number,
    billingData: any,
  ): Promise<string> {
    const response = await axios.post(
      `${this.PAYMOB_BASE}/acceptance/payment_keys`,
      {
        auth_token: token,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: paymobOrderId,
        billing_data: billingData,
        currency: 'EGP',
        integration_id: integrationId,
      },
    );
    return response.data.token;
  }

  // ── Main: Initiate payment ─────────────────────────────
  async initiatePayment(
    orderId: string,
    totalAmount: number,
    method: PaymentMethod,
    userId: string,
  ) {
    const amountCents = Math.round(totalAmount * 100);

    // Get order details
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) throw new BadRequestException('Order not found');

    // If Paymob not configured, return mock response for dev
    const apiKey = this.config.get<string>('PAYMOB_API_KEY');
    if (!apiKey || apiKey === 'your_paymob_api_key_here') {
      this.logger.warn('Paymob not configured — returning mock payment response');

      if (method === PaymentMethod.FAWRY) {
        return {
          fawryRefNumber: `FAWRY-MOCK-${Date.now()}`,
          message: 'Fawry reference generated (mock). Configure Paymob for production.',
        };
      }

      return {
        iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/mock?payment_token=MOCK_TOKEN_${Date.now()}`,
        message: 'Card iframe URL (mock). Configure Paymob for production.',
      };
    }

    try {
      // Real Paymob flow
      const billingData = {
        apartment: 'NA',
        email: order.user.email,
        floor: 'NA',
        first_name: order.user.firstName,
        street: 'NA',
        building: 'NA',
        phone_number: order.user.phone || '+20000000000',
        shipping_method: 'NA',
        postal_code: 'NA',
        city: 'Cairo',
        country: 'EG',
        last_name: order.user.lastName,
        state: 'Cairo',
      };

      const items = order.items.map((item) => ({
        name: String((item.productSnapshot as any)?.nameEn || 'Product'),
        amount_cents: Math.round(Number(item.unitPrice) * 100),
        description: String((item.productSnapshot as any)?.sku || ''),
        quantity: item.quantity,
      }));

      // Step 1: Auth
      const token = await this.getPaymobToken();

      // Step 2: Register order
      const { paymobOrderId } = await this.registerPaymobOrder(token, amountCents, items);

      // Update payment record with paymob order id
      await this.prisma.payment.update({
        where: { orderId },
        data: { paymobOrderId: String(paymobOrderId) },
      });

      // Step 3: Get payment key
      let integrationId: number;
      if (method === PaymentMethod.CARD) {
        integrationId = parseInt(
          this.config.get<string>('PAYMOB_INTEGRATION_ID_CARD') || '0',
        );
      } else {
        integrationId = parseInt(
          this.config.get<string>('PAYMOB_INTEGRATION_ID_FAWRY') || '0',
        );
      }

      const paymentKey = await this.getPaymentKey(
        token,
        paymobOrderId,
        amountCents,
        integrationId,
        billingData,
      );

      if (method === PaymentMethod.FAWRY) {
        return {
          fawryRefNumber: paymentKey,
          message: 'Pay at any Fawry outlet within 24 hours',
        };
      }

      // CARD: return iframe URL
      const iframeId = this.config.get<string>('PAYMOB_IFRAME_ID') || '0';
      return {
        iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`,
        message: 'Complete payment using the iframe URL',
      };
    } catch (error: any) {
      this.logger.error('Paymob payment initiation failed', error.message);
      throw new BadRequestException(
        `Payment initiation failed: ${error.message}`,
      );
    }
  }

  // ── Webhook: Paymob callback ──────────────────────────
  async handleWebhook(body: any, hmacParam?: string) {
    // Validate HMAC signature
    const hmacSecret = this.config.get<string>('PAYMOB_HMAC_SECRET');

    if (hmacSecret && hmacSecret !== 'your_hmac_secret' && hmacParam) {
      const isValid = this.validateHmac(body, hmacParam, hmacSecret);
      if (!isValid) {
        this.logger.warn('Invalid Paymob HMAC signature');
        return { received: true };
      }
    }

    const { obj } = body;
    if (!obj) return { received: true };

    const paymobOrderId = String(obj.order?.id);
    const transactionId = String(obj.id);
    const success = obj.success === true;
    const pending = obj.pending === true;

    // Find our order by paymob order id
    const payment = await this.prisma.payment.findFirst({
      where: { paymobOrderId },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for Paymob order: ${paymobOrderId}`);
      return { received: true };
    }

    if (success && !pending) {
      // Payment confirmed
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          transactionId,
          hmacVerified: true,
          paidAt: new Date(),
        },
      });

      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAYMENT_CONFIRMED },
      });

      await this.prisma.orderTracking.create({
        data: {
          orderId: payment.orderId,
          status: OrderStatus.PAYMENT_CONFIRMED,
          note: `Payment confirmed via Paymob. Transaction: ${transactionId}`,
        },
      });

      this.logger.log(`Order ${payment.orderId} payment confirmed`);
      // Notify customer about payment confirmation (fire-and-forget)
      this.prisma.order
        .findUnique({ where: { id: payment.orderId }, include: { user: true, items: true } })
        .then((enriched) => {
          if (enriched) this.notifications.notifyPaymentConfirmed(enriched).catch(() => {});
        })
        .catch((e) => this.logger.error('Payment notification fetch failed:', e.message));
    } else if (!success && !pending) {
      // Payment failed — restore stock
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, transactionId },
      });

      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      await this.ordersService.restoreStock(payment.orderId);

      this.logger.log(`Order ${payment.orderId} payment failed — stock restored`);
    }

    return { received: true };
  }

  // ── HMAC Validation ───────────────────────────────────
  private validateHmac(body: any, hmacParam: string, secret: string): boolean {
    try {
      const obj = body.obj || {};
      const concatenated = [
        obj.amount_cents,
        obj.created_at,
        obj.currency,
        obj.error_occured,
        obj.has_parent_transaction,
        obj.id,
        obj.integration_id,
        obj.is_3d_secure,
        obj.is_auth,
        obj.is_capture,
        obj.is_refunded,
        obj.is_standalone_payment,
        obj.is_voided,
        obj.order?.id,
        obj.owner,
        obj.pending,
        obj.source_data?.pan,
        obj.source_data?.sub_type,
        obj.source_data?.type,
        obj.success,
      ]
        .map((v) => String(v ?? ''))
        .join('');

      const computed = crypto
        .createHmac('sha512', secret)
        .update(concatenated)
        .digest('hex');

      return computed === hmacParam;
    } catch {
      return false;
    }
  }
}
