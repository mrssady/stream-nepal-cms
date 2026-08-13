import Link from "next/link";

import {
  getPublicEvents,
  type PublicEvent,
} from "@/services/public-events";

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

  return (
    <main className="bg-white">
      <section className="border-b bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
              Stream Nepal
            </p>

            <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-950">
              Events
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Explore events, productions, tournaments,
              broadcasts and memorable moments powered by
              Stream Nepal.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          {!events.length ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <h2 className="text-2xl font-bold text-slate-950">
                No events available
              </h2>

              <p className="mt-3 text-slate-600">
                Our event portfolio will be updated soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    {event.coverImage ? (
                      <img
                        src={event.coverImage}
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
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                          {event.category}
                        </span>
                      )}

                      {event.featured && (
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                          Featured
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-slate-950">
                      {event.title}
                    </h2>

                    {event.shortDescription && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {event.shortDescription}
                      </p>
                    )}

                    <div className="mt-4 space-y-2 text-sm text-slate-500">
                      <p>
                        Date:{" "}
                        <span className="font-medium text-slate-700">
                          {formatDate(event.eventDate)}
                        </span>
                      </p>

                      {event.location && (
                        <p>
                          Location:{" "}
                          <span className="font-medium text-slate-700">
                            {event.location}
                          </span>
                        </p>
                      )}

                      {event.client && (
                        <p>
                          Client:{" "}
                          <span className="font-medium text-slate-700">
                            {event.client}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>
                        {event.photos.length} photos
                      </span>

                      <span>•</span>

                      <span>
                        {event.videos.length} videos
                      </span>

                      {event.timeline.length > 0 && (
                        <>
                          <span>•</span>

                          <span>
                            {event.timeline.length} timeline entries
                          </span>
                        </>
                      )}
                    </div>

                    <Link
                      href={`/portfolio/events/${event.slug}`}
                      className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Event
                    </Link>
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