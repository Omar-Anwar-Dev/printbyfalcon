import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { orderConfirmationTemplate } from './templates/order-confirmation.template';
import { orderStatusTemplate } from './templates/order-status.template';
import { paymentConfirmedTemplate } from './templates/payment-confirmed.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly from: string;
  private readonly isEnabled: boolean;

  constructor(private config: ConfigService) {
    const host = config.get<string>('SMTP_HOST', '');
    const user = config.get<string>('SMTP_USER', '');
    const pass = config.get<string>('SMTP_PASS', '');
    this.from = config.get<string>(
      'EMAIL_FROM',
      'PrintByFalcon <noreply@printbyfalcon.com>',
    );
    this.isEnabled = !!(host && user && pass);

    if (this.isEnabled) {
      this.transporter = nodemailer.createTransport({
        host,
        port: config.get<number>('SMTP_PORT', 465),
        secure: config.get<string>('SMTP_SECURE', 'true') === 'true',
        auth: { user, pass },
      });
    }
  }

  async sendOrderConfirmation(
    to: string,
    data: {
      customerName: string;
      invoiceNumber: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      total: number;
      address: string;
      paymentMethod: string;
    },
  ) {
    const subject = `Order Confirmed #${data.invoiceNumber} — PrintByFalcon`;
    return this.send(to, subject, orderConfirmationTemplate(data));
  }

  async sendOrderStatusUpdate(
    to: string,
    data: {
      customerName: string;
      invoiceNumber: string;
      status: string;
      message: string;
    },
  ) {
    const subject = `Order #${data.invoiceNumber} Update — PrintByFalcon`;
    return this.send(to, subject, orderStatusTemplate(data));
  }

  async sendPaymentConfirmed(
    to: string,
    data: {
      customerName: string;
      amount: number;
      invoiceNumber: string;
    },
  ) {
    const subject = `Payment Confirmed — Order #${data.invoiceNumber}`;
    return this.send(to, subject, paymentConfirmedTemplate(data));
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.isEnabled) {
      this.logger.log(`[MOCK Email] To: ${to} | Subject: ${subject}`);
      return;
    }
    try {
      const info = await this.transporter!.sendMail({
        from: this.from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
    } catch (error: any) {
      this.logger.error(`Email failed to ${to}:`, error.message);
    }
  }
}
