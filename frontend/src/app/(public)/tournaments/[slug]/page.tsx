import Link from "next/link";
import { notFound } from "next/navigation";

import TournamentRegistrationForm from "@/components/public/TournamentRegistrationForm";

import {
  getPublicTournamentBySlug,
  type PublicTournamentDetail,
} from "@/services/public";

import { resolveMediaUrl } from "@/lib/media";

function formatDate(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

function formatMatchType(matchType?: string | null) {
  if (!matchType) {
    return null;
  }

  return matchType
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isRegistrationOpen(tournament: PublicTournamentDetail) {
  if (
    tournament.status === "CANCELLED" ||
    tournament.status === "COMPLETED" ||
    tournament.status === "DRAFT"
  ) {
    return false;
  }

  const now = new Date();

  if (now < new Date(tournament.registrationOpen)) {
    return false;
  }

  if (now > new Date(tournament.registrationClose)) {
    return false;
  }

  if (tournament.currentTeams >= tournament.maxTeams) {
    return false;
  }

  return true;
}

export default async function PublicTournamentDetailPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  let tournament: PublicTournamentDetail | null = null;

  try {
    tournament = await getPublicTournamentBySlug(slug);
  } catch {
    notFound();
  }

  if (!tournament) {
    notFound();
  }

  const registrationOpen = isRegistrationOpen(tournament);

  return (
    <main className="bg-white">
      {/* HERO */}

      <section className="border-b bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <Link
            href="/tournaments"
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            ← Back to Tournaments
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                {tournament.game && (
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    {tournament.game}
                  </span>
                )}

                {tournament.featured && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900">
                    Featured
                  </span>
                )}

                {tournament.status && (
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                    {formatStatus(tournament.status)}
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
                {tournament.name}
              </h1>

              {tournament.description && (
                <p className="mt-5 max-w-2xl whitespace-pre-wrap text-lg leading-8 text-slate-300">
                  {tournament.description}
                </p>
              )}

              <div className="mt-8 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Organizer
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {tournament.organizer}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Prize Pool
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {tournament.prizePool || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Entry Fee
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {tournament.registrationFee > 0
                      ? `Rs. ${tournament.registrationFee}`
                      : "Free"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Teams
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {tournament.currentTeams} /{" "}
                    {tournament.maxTeams}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {tournament.streamUrl && (
                  <a
                    href={tournament.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Watch Stream
                  </a>
                )}

                {tournament.websiteUrl && (
                  <a
                    href={tournament.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Tournament Website
                  </a>
                )}

                {tournament.discordUrl && (
                  <a
                    href={tournament.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Discord
                  </a>
                )}

                {tournament.whatsappUrl && (
                  <a
                    href={tournament.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              {tournament.banner ? (
                <img
                  src={resolveMediaUrl(tournament.banner)}
                  alt={tournament.name}
                  className="aspect-video w-full object-cover"
                />
              ) : tournament.logo ? (
                <div className="flex aspect-video items-center justify-center p-12">
                  <img
                    src={resolveMediaUrl(tournament.logo)}
                    alt={tournament.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center">
                  <span className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-600">
                    Stream Nepal
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DETAIL + REGISTRATION */}

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* SCHEDULE */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-2xl font-bold text-slate-950">
                  Schedule
                </h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Registration Opens
                    </p>

                    <p className="mt-1 font-medium text-slate-900">
                      {formatDateTime(tournament.registrationOpen)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Registration Closes
                    </p>

                    <p className="mt-1 font-medium text-slate-900">
                      {formatDateTime(tournament.registrationClose)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Tournament Starts
                    </p>

                    <p className="mt-1 font-medium text-slate-900">
                      {formatDate(tournament.tournamentStart)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Tournament Ends
                    </p>

                    <p className="mt-1 font-medium text-slate-900">
                      {formatDate(tournament.tournamentEnd)}
                    </p>
                  </div>
                </div>
              </div>

              {/* RULES */}

              {tournament.rules && (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-2xl font-bold text-slate-950">
                    Tournament Rules
                  </h2>

                  <div className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-600">
                    {tournament.rules}
                  </div>
                </div>
              )}

              {/* MATCHES */}

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-950">
                    Matches
                  </h2>

                  <span className="text-sm text-slate-500">
                    {tournament.matches.length} matches
                  </span>
                </div>

                {tournament.matches.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    Match fixtures will be published soon.
                  </p>
                ) : (
                  <div className="mt-6 space-y-3">
                    {tournament.matches.map((match) => (
                      <article
                        key={match.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 px-5 py-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {match.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {match.round
                              ? `Round ${match.round} • `
                              : ""}
                            {formatMatchType(match.matchType)}
                            {" • "}
                            {formatDateTime(match.scheduledAt) ||
                              "TBD"}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-slate-700">
                            {match.homeTeam.shortName ||
                              match.homeTeam.teamName}
                          </span>

                          <span className="text-lg font-bold text-slate-950">
                            {match.homeScore ?? "—"}
                          </span>

                          <span className="text-sm text-slate-400">
                            vs
                          </span>

                          <span className="text-lg font-bold text-slate-950">
                            {match.awayScore ?? "—"}
                          </span>

                          <span className="text-sm font-medium text-slate-700">
                            {match.awayTeam.shortName ||
                              match.awayTeam.teamName}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {/* REGISTRATION FORM */}

              {registrationOpen ? (
                <TournamentRegistrationForm tournament={tournament} />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                    Registration
                  </p>

                  <h3 className="mt-3 text-xl font-bold text-slate-950">
                    {tournament.status === "DRAFT"
                      ? "Registration not open yet"
                      : tournament.status === "CANCELLED"
                        ? "Tournament cancelled"
                        : tournament.status === "COMPLETED"
                          ? "Tournament completed"
                          : tournament.currentTeams >=
                              tournament.maxTeams
                            ? "All slots filled"
                            : "Registrations closed"}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {tournament.currentTeams >=
                    tournament.maxTeams
                      ? `All ${tournament.maxTeams} team slots are taken.`
                      : "Registration for this tournament is currently closed."}
                  </p>
                </div>
              )}

              {/* REGISTERED TEAMS */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-950">
                    Registered Teams
                  </h2>

                  <span className="text-sm text-slate-500">
                    {tournament.registrations.length}
                  </span>
                </div>

                {tournament.registrations.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No teams registered yet. Be the first!
                  </p>
                ) : (
                  <div className="mt-5 space-y-3">
                    {tournament.registrations.map((registration) => (
                      <div
                        key={registration.id}
                        className="flex items-center gap-3"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                          {registration.teamLogo ? (
                            <img
                              src={resolveMediaUrl(registration.teamLogo)}
                              alt={registration.teamName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-500">
                              {registration.shortName ||
                                registration.teamName
                                  .slice(0, 2)
                                  .toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {registration.teamName}
                          </p>

                          {registration.shortName && (
                            <p className="text-xs text-slate-500">
                              {registration.shortName}
                            </p>
                          )}
                        </div>

                        {registration.slotNumber ? (
                          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            Slot {registration.slotNumber}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}