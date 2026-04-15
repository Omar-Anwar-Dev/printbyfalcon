import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { StockAdjustmentReason } from '@prisma/client';

export class StockAdjustmentDto {
  @IsInt()
  @Type(() => Number)
  delta: number;

  @IsEnum(StockAdjustmentReason)
  reason: StockAdjustmentReason;

  @IsOptional()
  @IsString()
  note?: string;
}
