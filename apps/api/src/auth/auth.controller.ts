import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Session,
  HttpCode,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CartService } from '../cart/cart.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(forwardRef(() => CartService))
    private cartService: CartService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Session() session: Record<string, any>,
  ) {
    const result = await this.authService.register(dto);

    // Merge guest cart into user's new DB cart
    await this.cartService.mergeGuestCartOnLogin(result.user.id, session);

    return result;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Request() req: any,
    @Session() session: Record<string, any>,
    @Body() _dto: LoginDto,
  ) {
    return this.authService.login(req.user, session);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.userId, dto.refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Request() req: any, @Body() body: { refreshToken?: string }) {
    return this.authService.logout(req.user.sub, body.refreshToken);
  }
}
