export type PlayerRole =
  | "CAPTAIN"
  | "PLAYER"
  | "SUBSTITUTE"
  | "COACH"
  | "MANAGER";

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  teamName: string;
}

export interface TournamentTeam {
  id: string;
  teamName: string;
  shortName?: string | null;
  slotNumber?: number;
  registration?: TournamentRegistration | null;
}

export interface Player {
  id: string;
  teamId: string;
  fullName: string;
  inGameName: string;
  gameUID: string;
  role: PlayerRole;
  country?: string | null;
  nationality?: string | null;
  profileImage?: string | null;
  isActive: boolean;
  slotNumber?: number;
  team?: TournamentTeam | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerDto {
  teamId: string;
  fullName: string;
  inGameName: string;
  gameUID: string;
  role?: PlayerRole;
  country?: string;
  nationality?: string;
  profileImage?: string;
  isActive?: boolean;
  slotNumber?: number;
}

export interface UpdatePlayerDto {
  teamId?: string;
  fullName?: string;
  inGameName?: string;
  gameUID?: string;
  role?: PlayerRole;
  country?: string;
  nationality?: string;
  profileImage?: string;
  isActive?: boolean;
  slotNumber?: number;
}