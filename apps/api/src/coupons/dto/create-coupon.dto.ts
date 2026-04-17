import {
  IsBoolean, IsDateString, IsEnum, IsNotEmpty,
  IsNumber, IsOptional, IsString, Min,
} from 'class-validator';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  perCustomerLimit?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ValidateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  cartTotal: number;
}

export class FlashSaleDto {
  @IsString({ each: true })
  productIds: string[];

  @IsNumber()
  @Min(0)
  salePrice: number;
}
