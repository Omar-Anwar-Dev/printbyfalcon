import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminIpGuard implements CanActivate {
  private readonly allowedIps: string[];

  constructor(private config: ConfigService) {
    const raw = config.get<string>('ADMIN_IP_WHITELIST', '');
    this.allowedIps = raw ? raw.split(',').map((ip) => ip.trim()).filter(Boolean) : [];
  }

  canActivate(context: ExecutionContext): boolean {
    // If no whitelist configured, allow all (dev mode)
    if (this.allowedIps.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const clientIp =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.ip ||
      '';

    if (!this.allowedIps.includes(clientIp)) {
      throw new ForbiddenException('Access denied from this IP');
    }
    return true;
  }
}
