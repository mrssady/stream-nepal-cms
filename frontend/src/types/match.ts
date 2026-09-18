import type { Tournament } from "./tournament";

import type { TournamentTeam } from "./player";

export type MatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED";

export type MatchType =
  | "BO1"
  | "BO3"
  | "BO5"
  | "CUSTOM";

export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  winnerTeamId?: string | null;
  title: string;
  round?: string | null;
  matchType: MatchType;
  status: MatchStatus;
  scheduledAt: string;
  homeScore: number;
  awayScore: number;
  notes?: string | null;
  tournament?: Tournament | null;
  homeTeam?: TournamentTeam | null;
  awayTeam?: TournamentTeam | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatchDto {
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  winnerTeamId?: string;
  title: string;
  round?: string;
  matchType?: MatchType;
  status?: MatchStatus;
  scheduledAt: string;
  homeScore?: number;
  awayScore?: number;
  notes?: string;
}

export interface UpdateMatchDto {
  tournamentId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  winnerTeamId?: string;
  title?: string;
  round?: string;
  matchType?: MatchType;
  status?: MatchStatus;
  scheduledAt?: string;
  homeScore?: number;
  awayScore?: number;
  notes?: string;
}