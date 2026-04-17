import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from '@prisma/client';

const TICKET_INCLUDE = {
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
  replies: {
    where: { isInternal: false },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

const TICKET_INCLUDE_ADMIN = {
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
  replies: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  // ── Customer: create ticket ───────────────────────────
  async create(userId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        category: dto.category,
        subject: dto.subject,
        priority: dto.priority ?? 'MEDIUM',
        replies: {
          create: {
            userId,
            message: dto.message,
            isInternal: false,
          },
        },
      },
      include: TICKET_INCLUDE,
    });
    return ticket;
  }

  // ── Customer: get own tickets ─────────────────────────
  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where: { userId },
        include: TICKET_INCLUDE,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where: { userId } }),
    ]);
    return { data: tickets, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Customer: get single ticket ───────────────────────
  async findOne(ticketId: string, userId: string, isAdmin = false) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: isAdmin ? TICKET_INCLUDE_ADMIN : TICKET_INCLUDE,
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (!isAdmin && ticket.userId !== userId) throw new ForbiddenException('Access denied');
    return ticket;
  }

  // ── Customer/Admin: add reply ─────────────────────────
  async addReply(ticketId: string, userId: string, dto: CreateReplyDto, isAdmin = false) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (!isAdmin && ticket.userId !== userId) throw new ForbiddenException('Access denied');
    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException('Cannot reply to a closed ticket');
    }

    const [reply] = await this.prisma.$transaction([
      this.prisma.ticketReply.create({
        data: {
          ticketId,
          userId,
          message: dto.message,
          isInternal: isAdmin && (dto.isInternal ?? false),
        },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
      }),
      // Move ticket to IN_PROGRESS when admin replies
      ...(isAdmin && ticket.status === TicketStatus.OPEN
        ? [
            this.prisma.supportTicket.update({
              where: { id: ticketId },
              data: { status: TicketStatus.IN_PROGRESS },
            }),
          ]
        : []),
    ]);
    return reply;
  }

  // ── Customer: rate satisfaction ───────────────────────
  async rateSatisfaction(ticketId: string, userId: string, rating: number) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.userId !== userId) throw new ForbiddenException('Access denied');
    if (ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED) {
      throw new BadRequestException('Can only rate resolved or closed tickets');
    }
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { satisfaction: rating },
    });
  }

  // ── Admin: get all tickets ────────────────────────────
  async findAll(filters: {
    status?: string;
    priority?: string;
    category?: string;
    assignedToId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, priority, category, assignedToId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (assignedToId) where.assignedToId = assignedToId;

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: TICKET_INCLUDE_ADMIN,
        orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return { data: tickets, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Admin: update ticket (status/priority/assign) ─────
  async update(ticketId: string, dto: UpdateTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.assignedToId !== undefined && { assignedToId: dto.assignedToId }),
      },
      include: TICKET_INCLUDE_ADMIN,
    });
  }
}
