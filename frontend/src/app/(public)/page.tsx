import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Radio,
  Trophy,
  Video,
  Zap,
} from "lucide-react";

import {
  getPublicTournaments,
  type PublicTournament,
} from "@/services/public";

function formatDate(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatStatus(status?: string | null) {
  if (!status) {
    return null;
  }

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusStyle(status?: string | null) {
  const normalized = status?.toLowerCase();

  if (
    normalized === "live" ||
    normalized === "ongoing" ||
    normalized === "in_progress"
  ) {
    return "bg-red-500/10 text-red-500 border-red-500/20";
  }

  if (
    normalized === "upcoming" ||
    normalized === "scheduled"
  ) {
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  }

  return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
}

export default async function HomePage() {
  let tournaments: PublicTournament[] = [];

  try {
    tournaments = await getPublicTournaments();
  } catch {
    tournaments = [];
  }

  const featuredTournaments = tournaments
    .filter((tournament) => tournament.featured)
    .slice(0, 3);

  const displayedTournaments =
    featuredTournaments.length > 0
      ? featuredTournaments
      : tournaments.slice(0, 3);

  return (
    <main className="overflow-hidden bg-white text-slate-950 dark:bg-[#05070d] dark:text-white">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative isolate min-h-[calc(100vh-80px)] overflow-hidden bg-[#05070d] text-white">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[-20%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]"
        />

        <div
          aria-hidden="true"
          className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]"
        />

        <div
          aria-hidden="true"
          className="absolute -left-40 bottom-0 h-[350px] w-[350px] rounded-full bg-blue-700/10 blur-[120px]"
        />

        {/* Grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-6 py-24 lg:px-8">
          <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
            {/* Hero copy */}
            <div className="max-w-3xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,.9)]" />
                Live · Broadcast · Esports
              </div>

              <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
                We make events
                <span className="block text-blue-500">
                  worth watching.
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Stream Nepal delivers professional live broadcasting,
                esports production and event technology built to turn
                important moments into experiences people remember.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/portfolio/projects"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_40px_rgba(37,99,235,.25)] transition hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  Explore Our Work
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Start a Project
                </Link>
              </div>

              {/* Mini stats */}
              <div className="mt-14 grid max-w-xl grid-cols-3 border-y border-white/10 py-6">
                <div>
                  <p className="text-2xl font-black sm:text-3xl">
                    Live
                  </p>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    Production
                  </p>
                </div>

                <div className="border-l border-white/10 pl-5">
                  <p className="text-2xl font-black sm:text-3xl">
                    Esports
                  </p>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    Experience
                  </p>
                </div>

                <div className="border-l border-white/10 pl-5">
                  <p className="text-2xl font-black sm:text-3xl">
                    Nepal
                  </p>
                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                    Based
                  </p>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-xl">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur">
                {/* Main visual */}
                <div className="absolute inset-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-blue-600/20 via-slate-900 to-cyan-500/10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,.4),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,.2),transparent_30%)]" />

                  <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    LIVE PRODUCTION
                  </div>

                  {/* Camera / broadcast composition */}
                  <div className="absolute inset-x-8 top-24 bottom-32">
                    <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/20 bg-blue-500/10 blur-[1px]" />

                    <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/40 bg-blue-500/20 shadow-[0_0_80px_rgba(59,130,246,.4)]">
                      <div className="flex h-full items-center justify-center">
                        <Play
                          size={30}
                          fill="currentColor"
                          className="ml-1 text-white"
                        />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 gap-2">
                      <div className="h-2 rounded-full bg-blue-500/60" />
                      <div className="h-2 rounded-full bg-white/20" />
                      <div className="h-2 rounded-full bg-white/10" />
                    </div>
                  </div>

                  {/* Production overlay */}
                  <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                          Stream Nepal
                        </p>

                        <p className="mt-1 font-bold">
                          Broadcast Control
                        </p>
                      </div>

                      <Radio
                        size={20}
                        className="text-blue-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -left-4 top-24 rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-xl backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/15 p-2 text-blue-400">
                      <Video size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-bold">
                        Broadcast
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Multi-camera
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-28 rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-xl backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-400">
                      <Trophy size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-bold">
                        Esports
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Tournament production
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-[#05070d]" />
      </section>

      {/* =========================================================
          SERVICES
      ========================================================= */}
      <section className="border-b border-slate-200 bg-white py-24 dark:border-white/10 dark:bg-[#05070d]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                What we do
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Production that
                <span className="block text-slate-400 dark:text-slate-500">
                  feels bigger.
                </span>
              </h2>

              <p className="mt-6 max-w-md leading-7 text-slate-600 dark:text-slate-400">
                From esports tournaments to live events, we combine
                production, technology and creative execution into one
                reliable experience.
              </p>

              <Link
                href="/services"
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400"
              >
                Explore services
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  number: "01",
                  icon: Radio,
                  title: "Live Broadcasting",
                  text: "Professional multi-camera production, streaming and broadcast management.",
                },
                {
                  number: "02",
                  icon: Trophy,
                  title: "Esports Production",
                  text: "Tournament operations, observer systems, overlays and competitive broadcasts.",
                },
                {
                  number: "03",
                  icon: Video,
                  title: "Event Production",
                  text: "Visual production and live coverage designed around your audience.",
                },
                {
                  number: "04",
                  icon: Zap,
                  title: "Event Technology",
                  text: "Scoreboards, graphics, live data and digital systems that keep events moving.",
                },
              ].map((service) => {
                const Icon = service.icon;

                return (
                  <div
                    key={service.number}
                    className="group rounded-2xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="rounded-xl bg-blue-600/10 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <Icon size={21} />
                      </div>

                      <span className="text-xs font-bold text-slate-400">
                        {service.number}
                      </span>
                    </div>

                    <h3 className="mt-7 text-xl font-bold">
                      {service.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {service.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURED WORK
      ========================================================= */}
      <section className="bg-slate-50 py-24 dark:bg-[#080b12]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                Selected work
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Built for the spotlight.
              </h2>

              <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
                Explore productions, events and projects delivered by
                Stream Nepal.
              </p>
            </div>

            <Link
              href="/portfolio/projects"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400"
            >
              View all work
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Link
              href="/portfolio/projects"
              className="group relative min-h-[430px] overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,.45),transparent_35%),linear-gradient(135deg,#0f172a,#020617)] transition duration-500 group-hover:scale-105" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
                    Portfolio
                  </span>

                  <ArrowUpRight
                    size={22}
                    className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </div>

                <div>
                  <p className="text-sm text-blue-300">
                    Production & Events
                  </p>

                  <h3 className="mt-3 max-w-lg text-4xl font-black tracking-tight">
                    From local stages to competitive esports.
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
                    Discover how Stream Nepal combines broadcast
                    production and event technology to create memorable
                    experiences.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/portfolio/events"
              className="group relative min-h-[430px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="absolute right-[-15%] top-[-20%] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl transition group-hover:bg-blue-500/20" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    Events
                  </span>

                  <ArrowUpRight
                    size={22}
                    className="text-slate-400 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </div>

                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Event portfolio
                  </p>

                  <h3 className="mt-3 max-w-lg text-4xl font-black tracking-tight">
                    Every event has a story.
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Browse our event productions, visual coverage,
                    broadcasts and the moments behind them.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          TOURNAMENTS
      ========================================================= */}
      <section className="border-y border-slate-200 bg-white py-24 dark:border-white/10 dark:bg-[#05070d]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                  Tournament hub
                </p>
              </div>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                The competition starts here.
              </h2>
            </div>

            <Link
              href="/tournaments"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400"
            >
              Explore tournaments
              <ArrowRight size={16} />
            </Link>
          </div>

          {!displayedTournaments.length ? (
            <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <Trophy
                size={28}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-4 text-xl font-bold">
                Tournament updates coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
                Follow Stream Nepal for upcoming esports competitions,
                broadcasts and tournament announcements.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayedTournaments.map((tournament) => (
                <article
                  key={tournament.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                    {tournament.banner ? (
                      <img
                        src={tournament.banner}
                        alt={tournament.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : tournament.logo ? (
                      <div className="flex h-full items-center justify-center p-10">
                        <img
                          src={tournament.logo}
                          alt={tournament.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-600/10 to-cyan-500/10">
                        <Trophy
                          size={42}
                          className="text-blue-500/40"
                        />
                      </div>
                    )}

                    {tournament.status && (
                      <span
                        className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur ${getStatusStyle(
                          tournament.status,
                        )}`}
                      >
                        {formatStatus(tournament.status)}
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {tournament.game && (
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                          {tournament.game}
                        </span>
                      )}

                      {tournament.featured && (
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white dark:bg-white dark:text-slate-950">
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-xl font-black tracking-tight">
                      {tournament.name}
                    </h3>

                    {tournament.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {tournament.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
                      {tournament.tournamentStart ? (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Starts
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {formatDate(
                              tournament.tournamentStart,
                            )}
                          </p>
                        </div>
                      ) : (
                        <div />
                      )}

                      {tournament.prizePool && (
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Prize Pool
                          </p>

                          <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                            {tournament.prizePool}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {tournament.streamUrl && (
                        <a
                          href={tournament.streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500"
                        >
                          <Play
                            size={13}
                            fill="currentColor"
                          />
                          Watch Stream
                        </a>
                      )}

                      {tournament.slug && (
                        <Link
                          href={`/tournaments/${tournament.slug}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                        >
                          Details
                          <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          WHY STREAM NEPAL
      ========================================================= */}
      <section className="bg-slate-50 py-24 dark:bg-[#080b12]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
                Why Stream Nepal
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Technology meets
                <span className="block text-slate-400 dark:text-slate-500">
                  live experience.
                </span>
              </h2>

              <p className="mt-6 max-w-lg leading-7 text-slate-600 dark:text-slate-400">
                We don't just put an event online. We build the production
                system behind it — from cameras and graphics to live
                data, observers and audience experience.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Professional broadcast workflows",
                "Esports-focused production",
                "Live graphics & scoreboard systems",
                "Multi-platform streaming",
                "Event operations & technical support",
                "Creative post-production",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-xs font-black text-blue-600 dark:text-blue-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-sm font-semibold">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VIDEO / SHOWREEL
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#05070d] py-28 text-white">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[130px]"
        />

        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
            See it in action
          </p>

          <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
            Don't just take our word for it.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            See the energy, production and technology behind the events
            we deliver.
          </p>

          <div className="mx-auto mt-12 aspect-video max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600/20 via-slate-900 to-cyan-500/10 shadow-2xl">
            <div className="flex h-full flex-col items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_0_60px_rgba(37,99,235,.4)]">
                <Play
                  size={28}
                  fill="currentColor"
                  className="ml-1"
                />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                Stream Nepal Showreel
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Video showcase can be connected from the CMS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTACT CTA
      ========================================================= */}
      <section
        id="contact"
        className="bg-white py-28 dark:bg-[#05070d]"
      >
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 px-6 py-16 dark:border-white/10 dark:bg-white/[0.03] sm:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
              Have something coming up?
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
              Let's build something people remember.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">
              Tell us about your event, tournament or production and
              let's figure out how Stream Nepal can bring it to life.
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