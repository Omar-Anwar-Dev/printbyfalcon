import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CheckoutDto {
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @IsEnum(['STANDARD', 'EXPRESS'])
  shippingMethod: 'STANDARD' | 'EXPRESS';

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
