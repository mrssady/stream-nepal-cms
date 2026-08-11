import Link from "next/link";

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

export default async function TournamentsPage() {
  let tournaments: PublicTournament[] = [];

  try {
    tournaments = await getPublicTournaments();
  } catch {
    tournaments = [];
  }

  return (
    <main className="bg-white">
      <section className="border-b bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
              Stream Nepal
            </p>

            <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-950">
              Tournaments
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Explore upcoming esports tournaments organized and powered by
              Stream Nepal.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          {!tournaments.length ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <h2 className="text-2xl font-bold text-slate-950">
                No tournaments available
              </h2>

              <p className="mt-3 text-slate-600">
                Check back soon for upcoming tournaments and esports events.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((tournament) => (
                <article
                  key={tournament.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    {tournament.banner ? (
                      <img
                        src={tournament.banner}
                        alt={tournament.name}
                        className="h-full w-full object-cover"
                      />
                    ) : tournament.logo ? (
                      <div className="flex h-full items-center justify-center p-8">
                        <img
                          src={tournament.logo}
                          alt={tournament.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
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
                      {tournament.game && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                          {tournament.game}
                        </span>
                      )}

                      {tournament.featured && (
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                          Featured
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-slate-950">
                      {tournament.name}
                    </h2>

                    {tournament.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {tournament.description}
                      </p>
                    )}

                    {tournament.organizer && (
                      <p className="mt-4 text-sm text-slate-500">
                        Organizer:{" "}
                        <span className="font-medium text-slate-700">
                          {tournament.organizer}
                        </span>
                      </p>
                    )}

                    {tournament.prizePool && (
                      <p className="mt-2 text-sm text-slate-500">
                        Prize Pool:{" "}
                        <span className="font-semibold text-slate-700">
                          {tournament.prizePool}
                        </span>
                      </p>
                    )}

                    {tournament.tournamentStart && (
                      <p className="mt-2 text-sm text-slate-500">
                        Starts:{" "}
                        <span className="font-medium text-slate-700">
                          {formatDate(tournament.tournamentStart)}
                        </span>
                      </p>
                    )}

                    {tournament.status && (
                      <p className="mt-2 text-sm text-slate-500">
                        Status:{" "}
                        <span className="font-medium text-slate-700">
                          {formatStatus(tournament.status)}
                        </span>
                      </p>
                    )}

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
                          className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Tournament Website
                        </a>
                      )}

                      {tournament.discordUrl && (
                        <a
                          href={tournament.discordUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Discord
                        </a>
                      )}

                      {tournament.whatsappUrl && (
                        <a
                          href={tournament.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>

                    {tournament.slug && (
                      <Link
                        href={`/tournaments/${tournament.slug}`}
                        className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View tournament →
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}