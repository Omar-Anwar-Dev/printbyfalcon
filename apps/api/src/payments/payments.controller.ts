import {
  Controller,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private paymentsService: PaymentsService) {}

  // POST /api/v1/payments/callback — Paymob webhook
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async handleCallback(
    @Body() body: any,
    @Query('hmac') hmac?: string,
  ) {
    this.logger.log('Paymob webhook received');
    return this.paymentsService.handleWebhook(body, hmac);
  }
}
