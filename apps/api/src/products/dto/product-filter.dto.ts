import { IsOptional, IsString, IsNumber, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductFilterDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  brandSlug?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasDiscount?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
