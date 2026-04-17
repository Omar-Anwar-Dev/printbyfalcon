import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
  UseInterceptors, UploadedFile, ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // ── Public routes ─────────────────────────────────────────
  @Get('products')
  findAll(@Query() filter: ProductFilterDto) {
    return this.productsService.findAll(filter);
  }

  @Get('products/featured')
  getFeatured(
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getFeatured(limit);
  }

  @Get('products/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get('products/:slug/related')
  getRelated(
    @Param('slug') slug: string,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getRelatedBySlug(slug, limit);
  }

  // ── Admin routes ──────────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER')
  @Post('admin/products')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER')
  @Patch('admin/products/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER')
  @Post('admin/products/:id/images')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('sortOrder', new DefaultValuePipe(0), ParseIntPipe) sortOrder: number,
  ) {
    return this.productsService.uploadImage(id, file, sortOrder);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER')
  @Post('admin/products/:id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.productsService.duplicate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER')
  @Patch('admin/inventory/:id/stock')
  adjustStock(
    @Param('id') id: string,
    @Body() dto: StockAdjustmentDto,
    @Request() req: any,
  ) {
    return this.productsService.adjustStock(id, dto, req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER')
  @Post('admin/products/bulk-import')
  @UseInterceptors(FileInterceptor('file'))
  bulkImport(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('CSV file is required');
    return this.productsService.bulkImportFromCsv(file.buffer);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Delete('admin/products/:id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
