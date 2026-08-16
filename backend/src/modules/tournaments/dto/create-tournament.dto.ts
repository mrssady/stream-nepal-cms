import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { TournamentGame, TournamentStatus } from '@prisma/client';

export class CreateTournamentDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsEnum(TournamentGame)
  game!: TournamentGame;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  banner?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  rules?: string;

  @IsString()
  organizer!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  registrationFee?: number;

  @IsOptional()
  @IsString()
  prizePool?: string;

  @IsInt()
  @Min(1)
  maxTeams!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentTeams?: number;

  @IsDateString()
  registrationOpen!: string;

  @IsDateString()
  registrationClose!: string;

  @IsDateString()
  tournamentStart!: string;

  @IsDateString()
  tournamentEnd!: string;

  @IsOptional()
  @IsString()
  discordUrl?: string;

  @IsOptional()
  @IsString()
  whatsappUrl?: string;

  @IsOptional()
  @IsString()
  streamUrl?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;
}
