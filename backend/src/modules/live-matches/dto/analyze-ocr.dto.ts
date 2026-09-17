import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AnalyzeOcrDto {
  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  iterations?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  confirmations?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  dedupWindowMs?: number;

  @IsOptional()
  @IsBoolean()
  noise?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  seed?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0.5)
  @Max(1)
  confidenceBase?: number;
}
