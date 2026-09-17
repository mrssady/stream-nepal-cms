import type { TournamentGame } from "./tournament";

export type OcrRoiConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
  enabled: boolean;
  ocr: boolean;
  label: string;
  purpose: string;
  preprocessing: Record<string, unknown>;
};

export type OcrProfileConfig = {
  resolution: { width: number; height: number };
  rois: Record<string, OcrRoiConfig>;
  preprocessing: Record<string, unknown>;
};

export type OcrProfile = {
  id: string;
  game: TournamentGame;
  name: string;
  width: number;
  height: number;
  config: OcrProfileConfig;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateOcrProfileDto = {
  game: TournamentGame;
  name: string;
  width: number;
  height: number;
  config: OcrProfileConfig;
  isDefault?: boolean;
};

export type UpdateOcrProfileDto = Partial<CreateOcrProfileDto>;

export type ScaledRoisPayload = {
  reference: { width: number; height: number };
  resolution: { width: number; height: number };
  rois: Record<string, OcrRoiConfig>;
};