export type TournamentGame =
  | "PUBG_MOBILE"
  | "FREE_FIRE"
  | "VALORANT"
  | "CS2"
  | "DOTA2"
  | "EA_FC"
  | "EFOOTBALL"
  | "MOBILE_LEGENDS"
  | "OTHER";

export type TournamentStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED";

export type Tournament = {
  id: string;
  name: string;
  slug: string;
  game: TournamentGame;
  logo: string | null;
  banner: string | null;
  description: string | null;
  rules: string | null;
  organizer: string;
  registrationFee: number;
  prizePool: string | null;
  maxTeams: number;
  currentTeams: number;
  registrationOpen: string;
  registrationClose: string;
  tournamentStart: string;
  tournamentEnd: string;
  discordUrl: string | null;
  whatsappUrl: string | null;
  streamUrl: string | null;
  websiteUrl: string | null;
  featured: boolean;
  isPublic: boolean;
  status: TournamentStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateTournamentDto = {
  name: string;
  slug: string;
  game: TournamentGame;
  logo?: string;
  banner?: string;
  description?: string;
  rules?: string;
  organizer: string;
  registrationFee?: number;
  prizePool?: string;
  maxTeams: number;
  currentTeams?: number;
  registrationOpen: string;
  registrationClose: string;
  tournamentStart: string;
  tournamentEnd: string;
  discordUrl?: string;
  whatsappUrl?: string;
  streamUrl?: string;
  websiteUrl?: string;
  featured?: boolean;
  isPublic?: boolean;
  status?: TournamentStatus;
};

export type UpdateTournamentDto = {
  name?: string;
  slug?: string;
  game?: TournamentGame;
  logo?: string;
  banner?: string;
  description?: string;
  rules?: string;
  organizer?: string;
  registrationFee?: number;
  prizePool?: string;
  maxTeams?: number;
  currentTeams?: number;
  registrationOpen?: string;
  registrationClose?: string;
  tournamentStart?: string;
  tournamentEnd?: string;
  discordUrl?: string;
  whatsappUrl?: string;
  streamUrl?: string;
  websiteUrl?: string;
  featured?: boolean;
  isPublic?: boolean;
  status?: TournamentStatus;
};