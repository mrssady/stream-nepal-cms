import Link from "next/link";
import { ArrowRight, CalendarDays, Images, Play, Video } from "lucide-react";

import {
  getPublicEvents,
  type PublicEvent,
} from "@/services/public-events";

import { resolveMediaUrl } from "@/lib/media";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function EventsPage() {
  let events: PublicEvent[] = [];

  try {
    events = await getPublicEvents();
  } catch {
    events = [];
  }

  const featuredEvents = events.filter((event) => event.featured);

  const totalPhotos = events.reduce(
    (sum, event) => sum + event.photos.length,
    0,
  );

  const totalVideos = events.reduce(
    (sum, event) => sum + event.videos.length,
    0,
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
              Events
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              Every event has
              <span className="block text-blue-500">
                a story.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Browse the events, productions, tournaments and
              broadcasts produced by Stream Nepal — plus the moments
              captured along the way.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#events"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Browse events
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/portfolio/gallery"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                View gallery
              </Link>
            </div>

            {/* Mini stats */}

            <div className="mt-14 grid max-w-xl grid-cols-3 border-y border-white/10 py-6">
              <div>
                <p className="text-2xl font-black sm:text-3xl">
                  {events.length}
                </p>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Events
                </p>
              </div>

              <div className="border-l border-white/10 pl-5">
                <p className="text-2xl font-black sm:text-3xl">
                  {totalPhotos}
                </p>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Photos
                </p>
              </div>

              <div className="border-l border-white/10 pl-5">
                <p className="text-2xl font-black sm:text-3xl">
                  {totalVideos}
                </p>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                  Videos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}

      {featuredEvents.length > 0 && (
        <section className="border-b border-slate-200 bg-white py-20 dark:border-white/10 dark:bg-[#05070d]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                  Featured events
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                  The ones to remember.
                </h2>

                <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
                  Signature productions and coverage from Stream Nepal.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {featuredEvents.map((event) => (
                <article
                  key={event.id}
                  className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <Link href={`/portfolio/events/${event.slug}`}>
                    <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                      {event.coverImage ? (
                        <img
                          src={resolveMediaUrl(event.coverImage)}
                          alt={event.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Stream Nepal
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-7">
                      <div className="flex flex-wrap items-center gap-2">
                        {event.category && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            {event.category}
                          </span>
                        )}

                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                          Featured
                        </span>
                      </div>

                      <h2 className="mt-4 text-2xl font-black tracking-tight">
                        {event.title}
                      </h2>

                      {event.shortDescription && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {event.shortDescription}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>
                          Date:{" "}
                          <strong className="font-medium text-slate-700 dark:text-slate-300">
                            {formatDate(event.eventDate)}
                          </strong>
                        </span>

                        {event.location && (
                          <span>
                            Location:{" "}
                            <strong className="font-medium text-slate-700 dark:text-slate-300">
                              {event.location}
                            </strong>
                          </span>
                        )}
                      </div>

                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                        View Event
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALL EVENTS */}

      <section id="events" className="bg-slate-50 py-24 dark:bg-[#080b12]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                Event portfolio
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                All events.
              </h2>

              <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
                Every production we&apos;ve covered, from live shows to
                competitive esports.
              </p>
            </div>
          </div>

          {!events.length ? (
            <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <CalendarDays
                size={30}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-5 text-xl font-bold">
                No events available
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                Our event portfolio will be updated soon.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                    {event.coverImage ? (
                      <img
                        src={resolveMediaUrl(event.coverImage)}
                        alt={event.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Stream Nepal
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {event.category && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                          {event.category}
                        </span>
                      )}

                      {event.featured && (
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                          Featured
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-2xl font-black tracking-tight">
                      {event.title}
                    </h2>

                    {event.shortDescription && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {event.shortDescription}
                      </p>
                    )}

                    <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                      <p>
                        Date:{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {formatDate(event.eventDate)}
                        </span>
                      </p>

                      {event.location && (
                        <p>
                          Location:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {event.location}
                          </span>
                        </p>
                      )}

                      {event.client && (
                        <p>
                          Client:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {event.client}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Images size={13} />
                        {event.photos.length}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Play size={13} />
                        {event.videos.length}
                      </span>

                      {event.timeline.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Video size={13} />
                          {event.timeline.length} timeline
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/portfolio/events/${event.slug}`}
                      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
                    >
                      View Event
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
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
              Let&apos;s cover it like it deserves.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">
              Tell us about your event, tournament or production and
              let&apos;s figure out how Stream Nepal can bring it to life.
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
