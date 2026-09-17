import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLiveMatchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  matchNumber?: number;

  @IsOptional()
  @IsString()
  round?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
