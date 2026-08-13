import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getPublicEvents,
  type PublicEvent,
} from "@/services/public-events";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatPlatform(platform: string) {
  return platform
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function PublicEventDetailPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  let events: PublicEvent[] = [];

  try {
    events = await getPublicEvents();
  } catch {
    notFound();
  }

  const event = events.find(
    (item) => item.slug === slug,
  );

  if (!event) {
    notFound();
  }

  const sortedTimeline = [
    ...(event.timeline ?? []),
  ].sort(
    (a, b) =>
      new Date(a.timelineDate).getTime() -
      new Date(b.timelineDate).getTime(),
  );

  const featuredPhotos = event.photos.filter(
    (photo) => photo.featured,
  );

  const regularPhotos = event.photos.filter(
    (photo) => !photo.featured,
  );

  const photos = [
    ...featuredPhotos,
    ...regularPhotos,
  ];

  const featuredVideos = event.videos.filter(
    (video) => video.featured,
  );

  const regularVideos = event.videos.filter(
    (video) => !video.featured,
  );

  const videos = [
    ...featuredVideos,
    ...regularVideos,
  ];

  return (
    <main className="bg-white">
      {/* HERO */}

      <section className="border-b bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <Link
            href="/portfolio/events"
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            ← Back to Events
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                {event.category && (
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    {event.category}
                  </span>
                )}

                {event.featured && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900">
                    Featured
                  </span>
                )}

                {event.eventSeries && (
                  <Link
                    href={`/portfolio/events?series=${event.eventSeries.slug}`}
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    {event.eventSeries.title}
                  </Link>
                )}
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {event.title}
              </h1>

              {event.shortDescription && (
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  {event.shortDescription}
                </p>
              )}

              <div className="mt-8 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Date
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {formatDate(event.eventDate)}
                  </p>
                </div>

                {event.location && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Location
                    </p>

                    <p className="mt-1 font-medium text-white">
                      {event.location}
                    </p>
                  </div>
                )}

                {event.client && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Client
                    </p>

                    <p className="mt-1 font-medium text-white">
                      {event.client}
                    </p>
                  </div>
                )}

                {event.organizer && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Organizer
                    </p>

                    <p className="mt-1 font-medium text-white">
                      {event.organizer}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              {event.coverImage ? (
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="aspect-video w-full object-cover"
                />
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

      {/* OVERVIEW */}

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            About the Event
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {event.title}
          </h2>

          <div className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-600">
            {event.description ||
              event.shortDescription ||
              "No event description available."}
          </div>

          {event.eventUrl && (
            <a
              href={event.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Visit Event
            </a>
          )}
        </div>
      </section>

      {/* TIMELINE */}

      {sortedTimeline.length > 0 && (
        <section className="border-y bg-slate-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Journey
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                Event Timeline
              </h2>

              <p className="mt-3 text-slate-600">
                A chronological look at the important moments
                behind this event.
              </p>
            </div>

            <div className="mt-12 space-y-10">
              {sortedTimeline.map((item) => (
                <article
                  key={item.id}
                  className="relative border-l-2 border-slate-200 pl-8"
                >
                  <div className="absolute -left-[7px] top-1 size-3 rounded-full bg-blue-600" />

                  <p className="text-sm font-semibold text-blue-600">
                    {formatDate(item.timelineDate)}
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-950">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="mt-2 max-w-3xl whitespace-pre-wrap leading-7 text-slate-600">
                      {item.description}
                    </p>
                  )}

                  {item.imageUrl && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="max-h-96 w-full object-cover"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PHOTOS */}

      {photos.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                  Gallery
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-950">
                  Event Photos
                </h2>
              </div>

              <span className="text-sm text-slate-500">
                {photos.length} photos
              </span>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <figure
                  key={photo.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={
                        photo.imageUrl ||
                        photo.thumbnailUrl ||
                        ""
                      }
                      alt={
                        photo.title ||
                        event.title
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  {photo.title && (
                    <figcaption className="p-4 text-sm font-medium text-slate-700">
                      {photo.title}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIDEOS */}

      {videos.length > 0 && (
        <section className="border-t bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                  Watch
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-950">
                  Event Videos
                </h2>
              </div>

              <span className="text-sm text-slate-500">
                {videos.length} videos
              </span>
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {videos.map((video) => (
                <article
                  key={video.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {formatPlatform(video.platform)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      {formatPlatform(video.platform)}
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-slate-950">
                      {video.title}
                    </h3>

                    {video.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {video.description}
                      </p>
                    )}

                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Watch Video
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}