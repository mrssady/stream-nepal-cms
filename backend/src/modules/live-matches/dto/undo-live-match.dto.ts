import { IsInt, IsString, Min, ValidateIf } from 'class-validator';

export class UndoLiveMatchDto {
  @ValidateIf((item: UndoLiveMatchDto) => item.seq === undefined)
  @IsString()
  eventId?: string;

  @ValidateIf((item: UndoLiveMatchDto) => item.eventId === undefined)
  @IsInt()
  @Min(1)
  seq?: number;
}
