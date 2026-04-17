import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';
import { CartService } from '../cart/cart.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private cartService: CartService,
  ) {}

  // ── Register ──────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        role: Role.CUSTOMER,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // ── Login ─────────────────────────────────────────────────
  async login(user: any, session?: Record<string, any>) {
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    if (session) {
      await this.cartService.mergeGuestCartOnLogin(user.id, session);
    }

    // Frontend stores user in Zustand (welcome text, role-gated UI)
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // ── Validate user (used by LocalStrategy) ─────────────────
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    return user;
  }

  // ── Refresh tokens ────────────────────────────────────────
  async refreshTokens(userId: string, refreshToken: string) {
    const stored = await this.prisma.refreshToken.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
    });

    let matched: (typeof stored)[0] | null = null;
    for (const token of stored) {
      const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
      if (isMatch) { matched = token; break; }
    }

    if (!matched) throw new UnauthorizedException('Invalid refresh token');

    // Delete old token (rotation)
    await this.prisma.refreshToken.delete({ where: { id: matched.id } });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new UnauthorizedException();

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // ── Forgot password ───────────────────────────────────────
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If this email exists, a reset link was sent' };

    // TODO Day 8: Send actual email with reset link
    console.log(`Password reset requested for: ${email}`);
    return { message: 'If this email exists, a reset link was sent' };
  }

  // ── Get profile ───────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.sanitizeUser(user);
  }

  // ── Logout ────────────────────────────────────────────────
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const stored = await this.prisma.refreshToken.findMany({
        where: { userId },
      });
      for (const token of stored) {
        const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);
        if (isMatch) {
          await this.prisma.refreshToken.delete({ where: { id: token.id } });
          break;
        }
      }
    } else {
      // Logout all devices
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    return { message: 'Logged out successfully' };
  }

  // ── Private helpers ───────────────────────────────────────
  private async generateTokens(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
