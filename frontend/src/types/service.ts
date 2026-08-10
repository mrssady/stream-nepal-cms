export type Service = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  image: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateServiceDto = {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  featured?: boolean;
};

export type UpdateServiceDto = {
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  featured?: boolean;
};