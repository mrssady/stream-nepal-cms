import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { PlayerRole } from '@prisma/client';

export class CreatePlayerDto {
  @IsString()
  teamId!: string;

  @IsString()
  fullName!: string;

  @IsString()
  inGameName!: string;

  @IsString()
  gameUID!: string;

  @IsOptional()
  @IsEnum(PlayerRole)
  role?: PlayerRole;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
