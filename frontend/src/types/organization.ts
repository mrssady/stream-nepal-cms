export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: string;
  updatedAt: string;

  _count?: {
    users: number;
  };
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  logo?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  logo?: string;
}