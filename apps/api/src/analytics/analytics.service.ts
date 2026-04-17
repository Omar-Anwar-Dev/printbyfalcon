import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // ── Sales summary ──────────────────────────────────────
  async getSalesSummary(from: Date, to: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.PROCESSING] },
        createdAt: { gte: from, lte: to },
      },
      select: { total: true, createdAt: true },
    });

    const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

    return {
      revenue: Math.round(revenue * 100) / 100,
      orderCount,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      from,
      to,
    };
  }

  // ── Revenue by category ───────────────────────────────
  async getRevenueByCategory(from: Date, to: Date) {
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.PROCESSING] },
          createdAt: { gte: from, lte: to },
        },
      },
      include: {
        product: {
          include: { category: { select: { id: true, nameEn: true, nameAr: true } } },
        },
      },
    });

    const map = new Map<string, { categoryId: string; nameEn: string; nameAr: string; revenue: number; units: number }>();
    for (const item of items) {
      const cat = item.product?.category;
      if (!cat) continue;
      const key = cat.id;
      const existing = map.get(key) ?? { categoryId: cat.id, nameEn: cat.nameEn, nameAr: cat.nameAr, revenue: 0, units: 0 };
      existing.revenue += Number(item.price) * item.quantity;
      existing.units += item.quantity;
      map.set(key, existing);
    }

    return Array.from(map.values())
      .map((r) => ({ ...r, revenue: Math.round(r.revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  // ── Top products ──────────────────────────────────────
  async getTopProducts(limit = 10) {
    const products = await this.prisma.product.findMany({
      where: { soldCount: { gt: 0 } },
      orderBy: { soldCount: 'desc' },
      take: limit,
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        sku: true,
        price: true,
        soldCount: true,
        stock: true,
        images: { take: 1, select: { url: true } },
      },
    });
    return products;
  }

  // ── Top searches ──────────────────────────────────────
  async getTopSearches(limit = 20) {
    const searches = await this.prisma.searchAnalytics.groupBy({
      by: ['query'],
      _sum: { count: true },
      orderBy: { _sum: { count: 'desc' } },
      take: limit,
    });
    return searches.map((s) => ({ query: s.query, count: s._sum.count ?? 0 }));
  }

  // ── Dashboard summary ─────────────────────────────────
  async getDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalUsers,
      newUsersThisMonth,
      pendingOrders,
      currentMonthSales,
      prevMonthSales,
      openTickets,
      lowStockProducts,
      totalProducts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING_PAYMENT } }),
      this.getSalesSummary(startOfMonth, now),
      this.getSalesSummary(startOfPrevMonth, endOfPrevMonth),
      this.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] as any } } }),
      this.prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }),
      this.prisma.product.count({ where: { isActive: true } }),
    ]);

    const revenueGrowth =
      prevMonthSales.revenue > 0
        ? ((currentMonthSales.revenue - prevMonthSales.revenue) / prevMonthSales.revenue) * 100
        : 0;

    return {
      users: { total: totalUsers, newThisMonth: newUsersThisMonth },
      orders: { pending: pendingOrders },
      revenue: {
        thisMonth: currentMonthSales.revenue,
        lastMonth: prevMonthSales.revenue,
        growth: Math.round(revenueGrowth * 100) / 100,
      },
      support: { openTickets },
      inventory: { lowStock: lowStockProducts, totalActive: totalProducts },
    };
  }

  // ── Daily revenue chart ───────────────────────────────
  async getDailyRevenue(from: Date, to: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.PROCESSING] },
        createdAt: { gte: from, lte: to },
      },
      select: { total: true, createdAt: true },
    });

    const map = new Map<string, number>();
    for (const order of orders) {
      const day = order.createdAt.toISOString().split('T')[0];
      map.set(day, (map.get(day) ?? 0) + Number(order.total));
    }

    const result: { date: string; revenue: number }[] = [];
    const cursor = new Date(from);
    while (cursor <= to) {
      const day = cursor.toISOString().split('T')[0];
      result.push({ date: day, revenue: Math.round((map.get(day) ?? 0) * 100) / 100 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }
}
