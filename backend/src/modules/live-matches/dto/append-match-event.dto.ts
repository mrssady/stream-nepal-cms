import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { MatchEventSource } from '@prisma/client';

export class AppendMatchEventDto {
  @IsString()
  kind!: string;

  @IsOptional()
  @IsEnum(MatchEventSource)
  source?: MatchEventSource;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @IsOptional()
  @IsString()
  fingerprint?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
