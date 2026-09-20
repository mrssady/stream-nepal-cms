const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api";

export interface WebsiteSettings {
  companyName: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  discord?: string;
  tiktok?: string;
  linkedin?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  footerText?: string;
  copyrightText?: string;
}

export interface PublicService {
  id: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  image?: string | null;
  icon?: string | null;
  isActive?: boolean;
}

export interface PublicProject {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  coverImage: string | null;
  client: string | null;
  category: string | null;
  projectDate: string | null;
  projectUrl: string | null;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface PublicTournament {
  id: string;
  name: string;
  slug: string;
  game: string;
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
  status: string;
}

export interface PublicSponsor {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  tier: string;
  featured: boolean;
}

export interface PublicRegistrationTeam {
  id: string;
  teamName: string;
  teamLogo: string | null;
  slotNumber: number | null;
  shortName: string | null;
  teamStatus: string | null;
  createdAt: string;
}

export interface PublicMatchTeam {
  id: string;
  teamName: string;
  shortName: string;
  teamLogo: string | null;
}

export interface PublicMatch {
  id: string;
  title: string;
  round: string | null;
  matchType: string | null;
  status: string;
  scheduledAt: string;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: string | null;
  homeTeam: PublicMatchTeam;
  awayTeam: PublicMatchTeam;
}

export interface PublicLiveMatch {
  id: string;
  name: string | null;
  matchNumber: number | null;
  round: string | null;
  status: string;
}

export interface PublicTournamentDetail extends PublicTournament {
  registrations: PublicRegistrationTeam[];
  matches: PublicMatch[];
  liveMatch: PublicLiveMatch | null;
}

export interface PublicTournamentRegistrationDto {
  teamName: string;
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  managerName?: string;
  managerPhone?: string;
  discordUsername?: string;
  gameUID: string;
  gameIGN: string;
  rosterSize: number;
}

export interface PublicRegistrationCreated {
  id: string;
  teamName: string;
  registrationStatus: string;
  paymentStatus: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

async function publicRequest<T>(
  endpoint: string,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Public API request failed: ${response.status}`,
    );
  }

  const result =
    (await response.json()) as ApiResponse<T>;

  if (!result.success) {
    throw new Error(
      result.message ||
        "Public API request failed",
    );
  }

  return result.data;
}

async function publicPostRequest<T>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  const result =
    (await response.json()) as ApiResponse<T> & {
      message?: string;
      error?: string;
    };

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        result.error ||
        `Public API request failed: ${response.status}`,
    );
  }

  return result.data;
}

export function getPublicSettings() {
  return publicRequest<WebsiteSettings>(
    "/public/settings",
  );
}

export function getPublicServices() {
  return publicRequest<PublicService[]>(
    "/public/services",
  );
}

export function getPublicProjects() {
  return publicRequest<PublicProject[]>(
    "/public/projects",
  );
}

export function getPublicTournaments() {
  return publicRequest<PublicTournament[]>(
    "/public/tournaments",
  );
}

export function getPublicTournamentBySlug(
  slug: string,
) {
  return publicRequest<PublicTournamentDetail>(
    `/public/tournaments/${slug}`,
  );
}

export function submitPublicTournamentRegistration(
  slug: string,
  data: PublicTournamentRegistrationDto,
) {
  return publicPostRequest<PublicRegistrationCreated>(
    `/public/tournaments/${slug}/register`,
    data as unknown as Record<string, unknown>,
  );
}

export function getPublicSponsors() {
  return publicRequest<PublicSponsor[]>(
    "/public/sponsors",
  );
}