import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Radio,
  Sparkles,
  Trophy,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { getPublicService } from "@/services/services";
import type { Service } from "@/types/service";

import { resolveMediaUrl } from "@/lib/media";

const SERVICE_ICONS: Record<string, LucideIcon> = {
  radio: Radio,
  trophy: Trophy,
  video: Video,
  zap: Zap,
  sparkles: Sparkles,
};

function ServiceIcon({
  icon,
  ...props
}: {
  icon?: string | null;
  size?: number;
  className?: string;
}) {
  const value = icon?.toLowerCase() ?? "";
  let key = "sparkles";

  if (
    value.includes("radio") ||
    value.includes("broadcast") ||
    value.includes("live")
  ) {
    key = "radio";
  } else if (
    value.includes("trophy") ||
    value.includes("esport") ||
    value.includes("tournament")
  ) {
    key = "trophy";
  } else if (
    value.includes("video") ||
    value.includes("production") ||
    value.includes("camera")
  ) {
    key = "video";
  } else if (
    value.includes("zap") ||
    value.includes("tech") ||
    value.includes("digital")
  ) {
    key = "zap";
  }

  const Icon = SERVICE_ICONS[key];

  return <Icon {...props} />;
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  let service: Service | null = null;

  try {
    service = await getPublicService(slug);
  } catch {
    notFound();
  }

  if (!service) {
    notFound();
  }

  return (
    <main className="bg-white text-slate-950 dark:bg-[#05070d] dark:text-white">
      {/* HERO */}

      <section className="relative overflow-hidden bg-[#05070d] py-24 text-white sm:py-32">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[-30%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]"
        />

        <div
          aria-hidden="true"
          className="absolute -right-40 bottom-[-20%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <Link
            href="/services"
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            ← Back to Services
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                  <ServiceIcon icon={service.icon} size={22} />
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-blue-300 backdrop-blur">
                  Our Service
                </span>
              </div>

              <h1 className="mt-7 text-4xl font-black leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                {service.title}
              </h1>

              {service.shortDescription && (
                <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
                  {service.shortDescription}
                </p>
              )}
            </div>

            {service.image && (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                <img
                  src={resolveMediaUrl(service.image)}
                  alt={service.title}
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}

      {service.description && (
        <section className="border-b border-slate-200 py-20 dark:border-white/10">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
              About this service
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {service.title}
            </h2>

            <div className="mt-7 whitespace-pre-wrap text-lg leading-8 text-slate-600 dark:text-slate-300">
              {service.description}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED BANNER */}

      {service.featured && (
        <section className="border-b border-slate-200 bg-slate-50 py-20 dark:border-white/10 dark:bg-[#080b12]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] bg-[#05070d] text-white">
              <div className="grid lg:grid-cols-2">
                <div className="relative min-h-[320px] overflow-hidden">
                  {service.image ? (
                    <img
                      src={resolveMediaUrl(service.image)}
                      alt={service.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,.5),transparent_40%),linear-gradient(135deg,#0f172a,#020617)]">
                      <ServiceIcon
                        icon={service.icon}
                        size={56}
                        className="text-blue-400/60"
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/30 to-[#05070d]" />

                  <span className="absolute left-6 top-6 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur">
                    Featured service
                  </span>
                </div>

                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                    Why it matters
                  </p>

                  <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                    Production delivered with
                    precision.
                  </h2>

                  <p className="mt-5 leading-7 text-slate-300">
                    Every service at Stream Nepal is planned,
                    tested and operated to professional
                    standard, so your event runs smoothly
                    from start to finish.
                  </p>

                  <Link
                    href="/portfolio/projects"
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                  >
                    See it in action
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}

      <section className="py-28">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 px-6 py-16 dark:border-white/10 dark:bg-white/[0.03] sm:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
              Interested in {service.title}?
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Let&apos;s plan your production.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">
              Tell us about your event, tournament or project
              and we&apos;ll help you figure out the right production
              setup for your audience.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="mailto:info@streamnepal.com"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                Start a Conversation
                <ArrowRight size={16} />
              </a>

              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-7 py-3.5 text-sm font-bold transition hover:bg-white dark:border-white/10 dark:hover:bg-white/5"
              >
                All Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
