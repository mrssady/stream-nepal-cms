export type MediaPlatform =
  | "FACEBOOK"
  | "YOUTUBE"
  | "IMAGE"
  | "VIDEO";

export type Media = {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  platform: MediaPlatform;
  sourceUrl: string;
  thumbnailUrl: string | null;
  category: string | null;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateMediaDto = {
  title: string;
  description?: string;
  platform: MediaPlatform;
  sourceUrl: string;
  thumbnailUrl?: string;
  category?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
};

export type UpdateMediaDto = {
  title?: string;
  description?: string;
  platform?: MediaPlatform;
  sourceUrl?: string;
  thumbnailUrl?: string;
  category?: string;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
};