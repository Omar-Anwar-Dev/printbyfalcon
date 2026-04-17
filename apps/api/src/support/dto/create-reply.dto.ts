import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReplyDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
