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

export function getPublicSponsors() {
  return publicRequest<PublicSponsor[]>(
    "/public/sponsors",
  );
}