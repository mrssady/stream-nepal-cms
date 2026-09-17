import { IsOptional, IsString } from 'class-validator';

export class ReasonDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
