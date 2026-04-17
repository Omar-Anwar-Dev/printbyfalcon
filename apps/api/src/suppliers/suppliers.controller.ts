import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseOrderDto, UpdatePOStatusDto } from './dto/create-purchase-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN', 'SALES_MANAGER')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.suppliersService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }

  @Get(':id/performance')
  getPerformance(@Param('id') id: string) {
    return this.suppliersService.getPerformance(id);
  }

  // ── Purchase Orders ─────────────────────────────────
  @Post(':id/purchase-orders')
  createPO(@Param('id') id: string, @Body() dto: CreatePurchaseOrderDto) {
    return this.suppliersService.createPO(id, dto);
  }

  @Get(':id/purchase-orders')
  getPOs(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.suppliersService.getPOs(id, page, limit);
  }
}

@Controller('admin/purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN', 'SALES_MANAGER')
export class PurchaseOrdersController {
  constructor(private suppliersService: SuppliersService) {}

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePOStatusDto) {
    return this.suppliersService.updatePOStatus(id, dto);
  }
}
