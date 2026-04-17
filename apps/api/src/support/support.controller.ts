import {
  Controller, Get, Post, Patch,
  Param, Body, Query, Request, UseGuards,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateTicketDto, RateSatisfactionDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// ── Customer routes ────────────────────────────────────
@Controller('support/tickets')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post()
  create(@Body() dto: CreateTicketDto, @Request() req: any) {
    return this.supportService.create(req.user.sub, dto);
  }

  @Get()
  findMine(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.supportService.findByUser(req.user.sub, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.supportService.findOne(id, req.user.sub, false);
  }

  @Post(':id/reply')
  reply(
    @Param('id') id: string,
    @Body() dto: CreateReplyDto,
    @Request() req: any,
  ) {
    return this.supportService.addReply(id, req.user.sub, dto, false);
  }

  @Patch(':id/satisfaction')
  rateSatisfaction(
    @Param('id') id: string,
    @Body() dto: RateSatisfactionDto,
    @Request() req: any,
  ) {
    return this.supportService.rateSatisfaction(id, req.user.sub, dto.rating);
  }
}

// ── Admin routes ───────────────────────────────────────
@Controller('admin/support/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN', 'CUSTOMER_SERVICE')
export class AdminSupportController {
  constructor(private supportService: SupportService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.supportService.findAll({
      status: query.status,
      priority: query.priority,
      category: query.category,
      assignedToId: query.assignedToId,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.supportService.findOne(id, req.user.sub, true);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.supportService.update(id, dto);
  }

  @Post(':id/reply')
  reply(
    @Param('id') id: string,
    @Body() dto: CreateReplyDto,
    @Request() req: any,
  ) {
    return this.supportService.addReply(id, req.user.sub, dto, true);
  }
}
