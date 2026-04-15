import {
  Controller, Get, Post, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller()
export class SearchController {
  constructor(private searchService: SearchService) {}

  // ── Public: search products ───────────────────────────────
  @Get('products/search')
  search(
    @Query('q') q: string = '',
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
    @Query('hasDiscount') hasDiscount?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    return this.searchService.search({
      q,
      categoryId,
      brandId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock === 'true',
      hasDiscount: hasDiscount === 'true',
      sort,
      order,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      userId: req?.user?.sub,
    });
  }

  // ── Public: autocomplete ──────────────────────────────────
  @Get('products/autocomplete')
  autocomplete(@Query('q') q: string = '') {
    return this.searchService.autocomplete(q);
  }

  // ── Admin: bulk sync all products to Meilisearch ──────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post('admin/search/sync')
  bulkSync() {
    return this.searchService.bulkSync();
  }

  // ── Admin: popular search terms ───────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SALES_MANAGER')
  @Get('admin/search/popular')
  getPopularSearchTerms(@Query('limit') limit?: string) {
    return this.searchService.getPopularSearchTerms(
      limit ? Number(limit) : 20,
    );
  }
}
