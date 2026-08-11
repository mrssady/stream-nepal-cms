export type WebsiteSetting = {
  id?: string;

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

  createdAt?: string;
  updatedAt?: string;
};

export type UpdateWebsiteSetting = Omit<
  WebsiteSetting,
  "id" | "createdAt" | "updatedAt"
>;