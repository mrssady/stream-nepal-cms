import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { Prisma, TournamentGame } from '@prisma/client';

export class CreateOcrProfileDto {
  @IsEnum(TournamentGame)
  game!: TournamentGame;

  @IsString()
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  width!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  height!: number;

  @IsObject()
  config!: Prisma.InputJsonValue;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
