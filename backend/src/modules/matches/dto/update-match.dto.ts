import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  MatchStatus,
  MatchType,
} from '@prisma/client';

export class UpdateMatchDto {
  @IsOptional()
  @IsString()
  tournamentId?: string;

  @IsOptional()
  @IsString()
  homeTeamId?: string;

  @IsOptional()
  @IsString()
  awayTeamId?: string;

  @IsOptional()
  @IsString()
  winnerTeamId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  round?: string;

  @IsOptional()
  @IsEnum(MatchType)
  matchType?: MatchType;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  homeScore?: number;

  @IsOptional()
  awayScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}