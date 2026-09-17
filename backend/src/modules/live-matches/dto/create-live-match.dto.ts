import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateLiveMatchDto {
  @IsString()
  name!: string;

  @IsString()
  tournamentId!: string;

  @IsInt()
  @Min(1)
  matchNumber!: number;

  @IsOptional()
  @IsString()
  round?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
