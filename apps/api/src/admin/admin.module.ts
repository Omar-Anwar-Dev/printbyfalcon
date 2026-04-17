import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AdminIpGuard } from './guards/admin-ip.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuditLogService, AdminIpGuard],
  exports: [AuditLogService, AdminIpGuard],
})
export class AdminModule {}
