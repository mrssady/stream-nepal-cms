import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePublicRegistrationDto {
  @IsString()
  teamName!: string;

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
  @Max(10)
  rosterSize!: number;
}
