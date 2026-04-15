import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller()
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  // ── Public routes ─────────────────────────────────────────
  @Get('brands')
  findAll(@Query('featured') featured?: string) {
    return this.brandsService.findAll(featured === 'true');
  }

  @Get('brands/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }

  // ── Admin routes ──────────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER')
  @Post('admin/brands')
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER')
  @Patch('admin/brands/:id')
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER')
  @Patch('admin/brands/:id/featured')
  toggleFeatured(@Param('id') id: string) {
    return this.brandsService.toggleFeatured(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Delete('admin/brands/:id')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
