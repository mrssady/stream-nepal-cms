import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum ZoneOcrMode {
  MOCK = 'MOCK',
  VIDEO = 'VIDEO',
}

export class StartZoneOcrDto {
  @IsOptional()
  @IsEnum(ZoneOcrMode)
  mode?: ZoneOcrMode;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(200)
  @Max(10000)
  intervalMs?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(600)
  seconds?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  initialPhase?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  minChangeSeconds?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  confirmations?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120)
  resetJumpSeconds?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  minConfidence?: number;

  @IsOptional()
  @IsBoolean()
  noise?: boolean;

  @IsOptional()
  @IsString()
  source?: string;
}
