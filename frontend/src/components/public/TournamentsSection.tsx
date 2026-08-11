import type { PublicTournament } from "@/services/public";

interface TournamentsSectionProps {
  tournaments: PublicTournament[];
}

export default function TournamentsSection({
  tournaments,
}: TournamentsSectionProps) {
  if (!tournaments.length) {
    return null;
  }

  return (
    <section className="border-t bg-slate-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
            Esports
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight">
            Featured Tournaments
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-400">
            Follow upcoming tournaments, competitions and
            esports events powered by Stream Nepal.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <article
              key={tournament.id}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm"
            >
              <div className="aspect-video overflow-hidden bg-slate-800">
                {tournament.banner ? (
                  <img
                    src={tournament.banner}
                    alt={tournament.name}
                    className="h-full w-full object-cover"
                  />
                ) : tournament.logo ? (
                  <div className="flex h-full items-center justify-center">
                    <img
                      src={tournament.logo}
                      alt={tournament.name}
                      className="h-32 w-32 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Stream Nepal
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
                    {tournament.game}
                  </span>

                  <span className="text-xs font-medium text-slate-400">
                    {tournament.status}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold">
                  {tournament.name}
                </h3>

                {tournament.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                    {tournament.description}
                  </p>
                )}

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Prize Pool
                    </p>

                    <p className="mt-1 font-semibold">
                      {tournament.prizePool || "TBA"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Teams
                    </p>

                    <p className="mt-1 font-semibold">
                      {tournament.currentTeams}/
                      {tournament.maxTeams}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-800 pt-5">
                  <p className="text-xs text-slate-500">
                    Tournament starts
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-300">
                    {new Date(
                      tournament.tournamentStart,
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}