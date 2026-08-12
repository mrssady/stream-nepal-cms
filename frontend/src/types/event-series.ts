export type EventSeries = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  isActive: boolean;
  featured: boolean;
  displayOrder: number;
  _count?: {
    events: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreateEventSeriesDto = {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  isActive?: boolean;
  featured?: boolean;
  displayOrder?: number;
};

export type UpdateEventSeriesDto = {
  title?: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  isActive?: boolean;
  featured?: boolean;
  displayOrder?: number;
};