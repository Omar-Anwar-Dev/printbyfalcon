import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseOrderDto, UpdatePOStatusDto } from './dto/create-purchase-order.dto';
import { POStatus } from '@prisma/client';

// Valid status transitions for POs
const PO_TRANSITIONS: Partial<Record<POStatus, POStatus[]>> = {
  DRAFT: [POStatus.SENT, POStatus.CLOSED],
  SENT: [POStatus.CONFIRMED, POStatus.CLOSED],
  CONFIRMED: [POStatus.RECEIVED, POStatus.CLOSED],
  RECEIVED: [POStatus.CLOSED],
  CLOSED: [],
};

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  // ── Supplier CRUD ─────────────────────────────────────
  async create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where: { isActive: true },
        include: { _count: { select: { products: true, purchaseOrders: true } } },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.supplier.count({ where: { isActive: true } }),
    ]);
    return { data: suppliers, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        products: { select: { id: true, nameEn: true, sku: true, stock: true }, take: 10 },
        _count: { select: { products: true, purchaseOrders: true } },
      },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.supplier.update({ where: { id }, data: { isActive: false } });
  }

  // ── Purchase Orders ───────────────────────────────────
  async createPO(supplierId: string, dto: CreatePurchaseOrderDto) {
    await this.findOne(supplierId);

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0,
    );

    return this.prisma.purchaseOrder.create({
      data: {
        supplierId,
        notes: dto.notes,
        totalAmount,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: {
        items: { include: { product: { select: { nameEn: true, sku: true } } } },
        supplier: { select: { name: true } },
      },
    });
  }

  async getPOs(supplierId: string, page = 1, limit = 20) {
    await this.findOne(supplierId);
    const skip = (page - 1) * limit;
    const [pos, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where: { supplierId },
        include: {
          items: { include: { product: { select: { nameEn: true, sku: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.purchaseOrder.count({ where: { supplierId } }),
    ]);
    return { data: pos, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updatePOStatus(poId: string, dto: UpdatePOStatusDto) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true },
    });
    if (!po) throw new NotFoundException('Purchase order not found');

    const allowed = PO_TRANSITIONS[po.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${po.status} to ${dto.status}`,
      );
    }

    // On RECEIVED: increment stock for each item
    if (dto.status === POStatus.RECEIVED) {
      await Promise.all(
        po.items.map((item) =>
          this.prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity - item.receivedQty } },
          }),
        ),
      );
      await this.prisma.pOItem.updateMany({
        where: { purchaseOrderId: poId },
        data: { receivedQty: { set: 0 } }, // mark all as received via full qty
      });
      // Set receivedQty = quantity on each item
      await Promise.all(
        po.items.map((item) =>
          this.prisma.pOItem.update({
            where: { id: item.id },
            data: { receivedQty: item.quantity },
          }),
        ),
      );
    }

    return this.prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: dto.status, ...(dto.notes && { notes: dto.notes }) },
    });
  }

  // ── Supplier performance ──────────────────────────────
  async getPerformance(supplierId: string) {
    await this.findOne(supplierId);

    const [total, byStatus] = await Promise.all([
      this.prisma.purchaseOrder.count({ where: { supplierId } }),
      this.prisma.purchaseOrder.groupBy({
        by: ['status'],
        where: { supplierId },
        _count: { status: true },
        _sum: { totalAmount: true },
      }),
    ]);

    const statusMap = Object.fromEntries(
      byStatus.map((s) => [s.status, { count: s._count.status, totalAmount: Number(s._sum.totalAmount) }]),
    );

    const received = statusMap['RECEIVED']?.count ?? 0;
    const sent = (statusMap['SENT']?.count ?? 0) + (statusMap['CONFIRMED']?.count ?? 0) + received + (statusMap['CLOSED']?.count ?? 0);
    const fulfillmentRate = sent > 0 ? Math.round((received / sent) * 100) : null;

    return {
      supplierId,
      totalPurchaseOrders: total,
      byStatus: statusMap,
      fulfillmentRate: fulfillmentRate !== null ? `${fulfillmentRate}%` : 'N/A',
    };
  }
}
