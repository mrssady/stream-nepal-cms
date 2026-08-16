import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { MatchStatus, MatchType } from '@prisma/client';

export class CreateMatchDto {
  @IsString()
  tournamentId!: string;

  @IsString()
  homeTeamId!: string;

  @IsString()
  awayTeamId!: string;

  @IsOptional()
  @IsString()
  winnerTeamId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  round?: string;

  @IsOptional()
  @IsEnum(MatchType)
  matchType?: MatchType;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  homeScore?: number;

  @IsOptional()
  awayScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
