import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  PaymentStatus,
  RegistrationStatus,
} from '@prisma/client';

export class UpdateRegistrationDto {
  @IsOptional()
  @IsString()
  tournamentId?: string;

  @IsOptional()
  @IsString()
  teamName?: string;

  @IsOptional()
  @IsString()
  teamLogo?: string;

  @IsOptional()
  @IsString()
  captainName?: string;

  @IsOptional()
  @IsEmail()
  captainEmail?: string;

  @IsOptional()
  @IsString()
  captainPhone?: string;

  @IsOptional()
  @IsString()
  managerName?: string;

  @IsOptional()
  @IsString()
  managerPhone?: string;

  @IsOptional()
  @IsString()
  discordUsername?: string;

  @IsOptional()
  @IsString()
  gameUID?: string;

  @IsOptional()
  @IsString()
  gameIGN?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  rosterSize?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(RegistrationStatus)
  registrationStatus?: RegistrationStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}