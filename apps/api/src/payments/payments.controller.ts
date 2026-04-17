import {
  Controller,
  Post,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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

  // POST /api/v1/admin/orders/:id/refund
  @Post('/admin/orders/:id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  async refundOrder(@Param('id') id: string, @Request() req: any) {
    return this.paymentsService.refundOrder(id);
  }
}
