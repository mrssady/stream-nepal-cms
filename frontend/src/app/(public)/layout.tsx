import Link from "next/link";

import PublicNavbar from "@/components/public/PublicNavbar";
import { getPublicSettings } from "@/services/public-settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSettings();

  const companyName =
    settings?.companyName || "Stream Nepal";

  const tagline =
    settings?.tagline ||
    "Esports, broadcast and event production.";

  const footerText =
    settings?.footerText || tagline;

  const copyrightText =
    settings?.copyrightText ||
    `© ${new Date().getFullYear()} ${companyName}`;

  return (
    <div className="min-h-screen bg-white text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
      <PublicNavbar
        companyName={companyName}
        logo={settings?.logo}
      />

      <main>{children}</main>

      <footer className="border-t border-slate-200 bg-slate-950 text-white dark:border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link
                href="/"
                className="text-xl font-bold tracking-tight"
              >
                {companyName}
              </Link>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
                {footerText}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Explore
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
                <Link
                  href="/services"
                  className="transition hover:text-white"
                >
                  Services
                </Link>

                <Link
                  href="/portfolio/projects"
                  className="transition hover:text-white"
                >
                  Our Work
                </Link>

                <Link
                  href="/portfolio/events"
                  className="transition hover:text-white"
                >
                  Events
                </Link>

                <Link
                  href="/tournaments"
                  className="transition hover:text-white"
                >
                  Tournaments
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Connect
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
                {settings?.email && (
                  <a
                    href={`mailto:${settings.email}`}
                    className="transition hover:text-white"
                  >
                    {settings.email}
                  </a>
                )}

                {settings?.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="transition hover:text-white"
                  >
                    {settings.phone}
                  </a>
                )}

                {settings?.city && (
                  <span>
                    {settings.city}
                    {settings.country
                      ? `, ${settings.country}`
                      : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>{copyrightText}</p>

            <p>
              Professional live production &amp; esports.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}