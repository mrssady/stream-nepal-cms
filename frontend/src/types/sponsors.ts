export type SponsorTier =
  | "TITLE"
  | "GOLD"
  | "SILVER"
  | "BRONZE"
  | "MEDIA_PARTNER"
  | "PARTNER";

export type Sponsor = {
  id: string;
  organizationId: string;
  name: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  tier: SponsorTier;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateSponsorDto = {
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  tier?: SponsorTier;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
};

export type UpdateSponsorDto = {
  name?: string;
  logo?: string;
  website?: string;
  description?: string;
  tier?: SponsorTier;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
};
