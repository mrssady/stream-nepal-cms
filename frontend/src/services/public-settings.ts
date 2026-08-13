export type PublicSettings = {
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
};

type PublicSettingsResponse = {
  success: boolean;
  data: PublicSettings;
};

export async function getPublicSettings(): Promise<
  PublicSettings | null
> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api";

  try {
    const response = await fetch(
      `${apiUrl}/public/settings`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const result: PublicSettingsResponse =
      await response.json();

    return result.data ?? null;
  } catch (error) {
    console.error(
      "Failed to load public settings:",
      error,
    );

    return null;
  }
}