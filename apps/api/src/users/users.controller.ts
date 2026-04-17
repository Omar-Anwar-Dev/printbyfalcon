import {
  Controller, Get, Post, Patch,
  Param, Body, Query, Request, UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditLogService } from '../admin/audit-log.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private auditLog: AuditLogService,
  ) {}

  // GET /api/v1/admin/users
  @Get('users')
  @Roles('SUPERADMIN', 'CUSTOMER_SERVICE')
  findAll(@Query() query: any) {
    return this.usersService.findAll({
      search: query.search,
      role: query.role,
      isActive: query.isActive,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
    });
  }

  // GET /api/v1/admin/users/:id
  @Get('users/:id')
  @Roles('SUPERADMIN', 'CUSTOMER_SERVICE')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // PATCH /api/v1/admin/users/:id — block/unblock, change role
  @Patch('users/:id')
  @Roles('SUPERADMIN', 'CUSTOMER_SERVICE')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req: any,
  ) {
    const result = await this.usersService.update(id, dto, req.user.role);
    this.auditLog
      .log({ userId: req.user.sub, action: 'UPDATE_USER', entityType: 'User', entityId: id, diff: dto })
      .catch(() => {});
    return result;
  }

  // POST /api/v1/admin/staff — create staff account
  @Post('staff')
  @Roles('SUPERADMIN')
  async createStaff(@Body() dto: CreateStaffDto, @Request() req: any) {
    const result = await this.usersService.createStaff(dto);
    this.auditLog
      .log({ userId: req.user.sub, action: 'CREATE_STAFF', entityType: 'User', entityId: result.id, diff: { role: dto.role } })
      .catch(() => {});
    return result;
  }

  // GET /api/v1/admin/audit-log
  @Get('audit-log')
  @Roles('SUPERADMIN')
  getAuditLog(@Query() query: any) {
    return this.auditLog.findAll({
      userId: query.userId,
      entityType: query.entityType,
      action: query.action,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 30,
    });
  }
}
