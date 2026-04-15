import { IsInt, IsString, IsOptional, Min, Max, IsUUID } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}

export class ApplyCouponDto {
  @IsString()
  couponCode: string;
}
