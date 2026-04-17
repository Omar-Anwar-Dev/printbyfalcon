import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    search?: string;
    role?: string;
    isActive?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, role, isActive, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        addresses: true,
        _count: { select: { orders: true, supportTickets: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, actorRole: Role) {
    await this.findOne(id);

    // Only SUPERADMIN can change roles
    if (dto.role && actorRole !== Role.SUPERADMIN) {
      throw new BadRequestException('Only SUPERADMIN can change user roles');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, firstName: true, lastName: true,
        email: true, role: true, isActive: true,
      },
    });
  }

  async createStaff(dto: CreateStaffDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    // Staff roles only — prevent creating another SUPERADMIN via this endpoint
    const allowedRoles: Role[] = [Role.SALES_MANAGER, Role.CUSTOMER_SERVICE, Role.SUPPLIER];
    if (!allowedRoles.includes(dto.role)) {
      throw new BadRequestException('Invalid staff role');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        role: dto.role,
        isVerified: true,
      },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, role: true, createdAt: true,
      },
    });
  }
}
