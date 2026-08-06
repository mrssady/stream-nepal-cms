import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { TeamStatus } from '@prisma/client';

export class CreateTournamentTeamDto {
  @IsString()
  registrationId!: string;

  @IsString()
  teamName!: string;

  @IsOptional()
  @IsString()
  teamLogo?: string;

  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  wins?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  losses?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  kills?: number;
}