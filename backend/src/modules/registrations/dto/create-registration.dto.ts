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

export class CreateRegistrationDto {
  @IsString()
  tournamentId!: string;

  @IsString()
  teamName!: string;

  @IsOptional()
  @IsString()
  teamLogo?: string;

  @IsString()
  captainName!: string;

  @IsEmail()
  captainEmail!: string;

  @IsString()
  captainPhone!: string;

  @IsOptional()
  @IsString()
  managerName?: string;

  @IsOptional()
  @IsString()
  managerPhone?: string;

  @IsOptional()
  @IsString()
  discordUsername?: string;

  @IsString()
  gameUID!: string;

  @IsString()
  gameIGN!: string;

  @IsInt()
  @Min(1)
  rosterSize!: number;

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