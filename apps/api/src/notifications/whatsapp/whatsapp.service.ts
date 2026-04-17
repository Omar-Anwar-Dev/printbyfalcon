import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly isEnabled: boolean;

  constructor(private config: ConfigService) {
    this.token = config.get<string>('WHATSAPP_TOKEN', '');
    const phoneNumberId = config.get<string>('WHATSAPP_PHONE_NUMBER_ID', '');
    this.apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    this.isEnabled = !!(this.token && phoneNumberId);
  }

  async sendOrderConfirmation(
    phone: string,
    data: {
      customerName: string;
      invoiceNumber: string;
      total: number;
      estimatedDelivery: string;
      trackingUrl: string;
    },
  ) {
    if (!this.isEnabled) {
      this.logger.log(
        `[MOCK WhatsApp] order_confirmation → ${phone} | Order ${data.invoiceNumber}`,
      );
      return;
    }
    return this.sendTemplate(phone, 'order_confirmation', [
      data.customerName,
      data.invoiceNumber,
      data.total.toFixed(2),
      data.estimatedDelivery,
      data.trackingUrl,
    ]);
  }

  async sendOrderStatusUpdate(
    phone: string,
    data: {
      customerName: string;
      invoiceNumber: string;
      status: string;
      message: string;
    },
  ) {
    if (!this.isEnabled) {
      this.logger.log(
        `[MOCK WhatsApp] order_status_update → ${phone} | Order ${data.invoiceNumber} → ${data.status}`,
      );
      return;
    }
    return this.sendTemplate(phone, 'order_status_update', [
      data.customerName,
      data.invoiceNumber,
      data.status,
      data.message,
    ]);
  }

  async sendPaymentConfirmed(
    phone: string,
    data: {
      customerName: string;
      amount: number;
      invoiceNumber: string;
    },
  ) {
    if (!this.isEnabled) {
      this.logger.log(
        `[MOCK WhatsApp] payment_confirmed → ${phone} | Order ${data.invoiceNumber}`,
      );
      return;
    }
    return this.sendTemplate(phone, 'payment_confirmed', [
      data.customerName,
      data.amount.toFixed(2),
      data.invoiceNumber,
    ]);
  }

  private async sendTemplate(phone: string, templateName: string, params: string[]) {
    // Meta requires phone in international format without '+': e.g. 201234567890
    const formattedPhone = phone.replace(/^\+/, '');
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: params.map((text) => ({ type: 'text', text })),
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`WhatsApp sent [${templateName}] to ${formattedPhone}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `WhatsApp failed [${templateName}] to ${formattedPhone}:`,
        error?.response?.data || error.message,
      );
    }
  }
}
