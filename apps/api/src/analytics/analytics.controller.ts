import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import * as ExcelJS from 'exceljs';

function parseDateRange(from?: string, to?: string): { from: Date; to: Date } {
  const now = new Date();
  const toDate = to ? new Date(to) : now;
  const fromDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: fromDate, to: toDate };
}

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN', 'SALES_MANAGER')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.analyticsService.getDashboard();
  }

  @Get('sales')
  getSales(@Query('from') from?: string, @Query('to') to?: string) {
    const range = parseDateRange(from, to);
    return this.analyticsService.getSalesSummary(range.from, range.to);
  }

  @Get('daily-revenue')
  getDailyRevenue(@Query('from') from?: string, @Query('to') to?: string) {
    const range = parseDateRange(from, to);
    return this.analyticsService.getDailyRevenue(range.from, range.to);
  }

  @Get('revenue-by-category')
  getRevenueByCategory(@Query('from') from?: string, @Query('to') to?: string) {
    const range = parseDateRange(from, to);
    return this.analyticsService.getRevenueByCategory(range.from, range.to);
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit?: string) {
    return this.analyticsService.getTopProducts(limit ? parseInt(limit) : 10);
  }

  @Get('top-searches')
  getTopSearches(@Query('limit') limit?: string) {
    return this.analyticsService.getTopSearches(limit ? parseInt(limit) : 20);
  }

  @Get('abandoned-cart-rate')
  getAbandonedCartRate() {
    return this.analyticsService.getAbandonedCartRate();
  }

  @Get('export')
  @Roles('SUPERADMIN')
  async exportExcel(
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const range = parseDateRange(from, to);
    const [sales, byCategory, topProducts] = await Promise.all([
      this.analyticsService.getSalesSummary(range.from, range.to),
      this.analyticsService.getRevenueByCategory(range.from, range.to),
      this.analyticsService.getTopProducts(20),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PrintByFalcon';

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Sales Summary');
    summarySheet.addRow(['Metric', 'Value']);
    summarySheet.addRow(['Revenue (EGP)', sales.revenue]);
    summarySheet.addRow(['Total Orders', sales.orderCount]);
    summarySheet.addRow(['Avg Order Value (EGP)', sales.avgOrderValue]);
    summarySheet.addRow(['Period', `${range.from.toISOString().split('T')[0]} → ${range.to.toISOString().split('T')[0]}`]);
    summarySheet.getRow(1).font = { bold: true };

    // Revenue by category
    const catSheet = workbook.addWorksheet('Revenue by Category');
    catSheet.addRow(['Category (EN)', 'Category (AR)', 'Revenue (EGP)', 'Units Sold']);
    catSheet.getRow(1).font = { bold: true };
    for (const row of byCategory) {
      catSheet.addRow([row.nameEn, row.nameAr, row.revenue, row.units]);
    }

    // Top products
    const prodSheet = workbook.addWorksheet('Top Products');
    prodSheet.addRow(['Product (EN)', 'SKU', 'Price (EGP)', 'Units Sold', 'Stock']);
    prodSheet.getRow(1).font = { bold: true };
    for (const p of topProducts) {
      prodSheet.addRow([p.nameEn, p.sku, Number(p.price), p.soldCount, p.stock]);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=printbyfalcon-analytics-${range.from.toISOString().split('T')[0]}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  }
}
