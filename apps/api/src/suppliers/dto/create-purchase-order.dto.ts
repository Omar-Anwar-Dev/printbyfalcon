import {
  IsArray, IsEnum, IsNotEmpty, IsNumber,
  IsOptional, IsString, Min, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { POStatus } from '@prisma/client';

export class POItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POItemDto)
  items: POItemDto[];
}

export class UpdatePOStatusDto {
  @IsEnum(POStatus)
  status: POStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
