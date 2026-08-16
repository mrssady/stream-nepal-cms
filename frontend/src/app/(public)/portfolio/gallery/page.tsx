import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Film,
  Image,
  Images,
  MonitorPlay,
  ThumbsUp,
} from "lucide-react";

import { getPublicMedia } from "@/services/public-media";
import type { Media } from "@/types/media";

import { resolveMediaUrl } from "@/lib/media";

function formatPlatform(platform: string) {
  return platform
    .charAt(0)
    .toUpperCase() + platform.slice(1).toLowerCase();
}

function getPlatformIcon(platform: string) {
  if (platform === "FACEBOOK") {
    return ThumbsUp;
  }

  if (platform === "YOUTUBE") {
    return MonitorPlay;
  }

  if (platform === "IMAGE") {
    return Image;
  }

  return Film;
}

function getPlatformTone(platform: string) {
  if (platform === "FACEBOOK") {
    return "bg-blue-600/10 text-blue-400 border-blue-500/20";
  }

  if (platform === "YOUTUBE") {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }

  if (platform === "IMAGE") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
}

export default async function GalleryPage() {
  let media: Media[] = [];

  try {
    media = await getPublicMedia();
  } catch {
    media = [];
  }

  const featuredMedia = media.filter(
    (item) => item.featured,
  );

  return (
    <main className="overflow-hidden bg-white text-slate-950 dark:bg-[#05070d] dark:text-white">
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
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-300 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,.9)]" />
              Gallery
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              Moments we
              <span className="block text-blue-500">
                helped create.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Photos, videos and social highlights from the
              events, tournaments and productions delivered by
              Stream Nepal.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED */}

      {featuredMedia.length > 0 && (
        <section className="border-b border-slate-200 bg-white py-20 dark:border-white/10 dark:bg-[#05070d]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                  Highlights
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                  Featured moments.
                </h2>
              </div>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredMedia.map((item) => {
                const Icon = getPlatformIcon(item.platform);

                return (
                  <a
                    key={item.id}
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                      {item.thumbnailUrl ? (
                        <img
                          src={resolveMediaUrl(item.thumbnailUrl)}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Icon
                            size={40}
                            className="text-slate-300 dark:text-slate-700"
                          />
                        </div>
                      )}

                      <span
                        className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${getPlatformTone(
                          item.platform,
                        )}`}
                      >
                        <Icon size={11} />
                        {formatPlatform(item.platform)}
                      </span>

                      <span className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        Featured
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-black tracking-tight">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between">
                        {item.category && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            {item.category}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                          Open
                          <ArrowUpRight
                            size={14}
                            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ALL MEDIA */}

      <section className="bg-slate-50 py-24 dark:bg-[#080b12]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                Gallery
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Everything we&apos;ve captured.
              </h2>

              <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
                A growing collection of live streams, videos and
                behind-the-scenes moments managed through the CMS.
              </p>
            </div>
          </div>

          {!media.length ? (
            <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <Images
                size={30}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-5 text-xl font-bold">
                Gallery coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                Photos and video highlights from our events will
                appear here soon.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => {
                const Icon = getPlatformIcon(item.platform);

                return (
                  <a
                    key={item.id}
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                      {item.thumbnailUrl ? (
                        <img
                          src={resolveMediaUrl(item.thumbnailUrl)}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Icon
                            size={40}
                            className="text-slate-300 dark:text-slate-700"
                          />
                        </div>
                      )}

                      <span
                        className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${getPlatformTone(
                          item.platform,
                        )}`}
                      >
                        <Icon size={11} />
                        {formatPlatform(item.platform)}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-black tracking-tight">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between">
                        {item.category && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            {item.category}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                          Open
                          <ArrowUpRight
                            size={14}
                            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CONTACT CTA */}

      <section
        id="contact"
        className="bg-white py-28 dark:bg-[#05070d]"
      >
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 px-6 py-16 dark:border-white/10 dark:bg-white/[0.03] sm:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
              Have an event coming up?
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
              Let&apos;s make the next highlight yours.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">
              Tell us about your event, tournament or production
              and we&apos;ll help bring it to life.
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
                href="/portfolio/projects"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-7 py-3.5 text-sm font-bold transition hover:bg-white dark:border-white/10 dark:hover:bg-white/5"
              >
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
