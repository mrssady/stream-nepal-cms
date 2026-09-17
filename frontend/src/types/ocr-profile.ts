import type { TournamentGame } from "./tournament";

export type OcrProfile = {
  id: string;
  game: TournamentGame;
  name: string;
  width: number;
  height: number;
  config: Record<string, unknown>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateOcrProfileDto = {
  game: TournamentGame;
  name: string;
  width: number;
  height: number;
  config: Record<string, unknown>;
  isDefault?: boolean;
};

export type UpdateOcrProfileDto = Partial<CreateOcrProfileDto>;