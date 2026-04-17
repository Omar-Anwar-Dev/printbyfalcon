import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Request,
  Session,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderStatus } from '@prisma/client';

@Controller()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // POST /api/v1/orders/checkout
  @UseGuards(JwtAuthGuard)
  @Post('orders/checkout')
  checkout(
    @Request() req: any,
    @Session() session: Record<string, any>,
    @Body() dto: CheckoutDto,
  ) {
    return this.ordersService.checkout(req.user.sub, dto, session);
  }

  // GET /api/v1/orders
  @UseGuards(JwtAuthGuard)
  @Get('orders')
  getMyOrders(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ordersService.getUserOrders(req.user.sub, page, limit);
  }

  // GET /api/v1/orders/:id
  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  getOrder(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.getOrderById(id, req.user.sub);
  }

  // ── Admin routes ──────────────────────────────────────

  // GET /api/v1/admin/orders
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER', 'CUSTOMER_SERVICE')
  @Get('admin/orders')
  getAllOrders(
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.ordersService.getAllOrders({ status, paymentMethod, dateFrom, dateTo, customerId, search, page, limit });
  }

  // PATCH /api/v1/admin/orders/:id/status
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER', 'CUSTOMER_SERVICE')
  @Patch('admin/orders/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: {
      status: OrderStatus;
      note?: string;
      courierName?: string;
      trackingNumber?: string;
    },
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      body.status,
      body.note,
      body.courierName,
      body.trackingNumber,
    );
  }
}
