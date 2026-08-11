import Link from "next/link";

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
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            {companyName}
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-medium hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/services"
              className="text-sm font-medium hover:text-blue-600"
            >
              Services
            </Link>

            <Link
              href="/projects"
              className="text-sm font-medium hover:text-blue-600"
            >
              Projects
            </Link>

            <Link
              href="/events"
              className="text-sm font-medium hover:text-blue-600"
            >
              Events
            </Link>

            <Link
              href="/gallery"
              className="text-sm font-medium hover:text-blue-600"
            >
              Gallery
            </Link>

            <Link
              href="/contact"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">
                {companyName}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {footerText}
              </p>
            </div>

            <p className="text-sm text-slate-500">
              {copyrightText}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}