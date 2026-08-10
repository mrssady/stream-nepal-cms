export type Project = {
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
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectDto = {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  coverImage?: string;
  client?: string;
  category?: string;
  projectDate?: string;
  projectUrl?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
};

export type UpdateProjectDto = {
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  coverImage?: string;
  client?: string;
  category?: string;
  projectDate?: string;
  projectUrl?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
};