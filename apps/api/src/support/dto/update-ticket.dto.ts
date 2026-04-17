import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { TicketPriority, TicketStatus } from '@prisma/client';

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class RateSatisfactionDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
