"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Handshake,
  Image as ImageIcon,
  MapPin,
  Play,
} from "lucide-react";

import {
  getEventById,
  type Event,
  type EventPhoto,
  type EventSponsor,
  type EventTimeline as EventTimelineItem,
  type EventVideo,
} from "@/services/event";

import {
  getEventPhotos,
  getEventSponsors,
  getEventTimeline,
  getEventVideos,
} from "@/services/event-content";

import EventOverview from "@/components/events/detail/EventOverview";
import EventPhotos from "@/components/events/detail/EventPhotos";
import EventVideos from "@/components/events/detail/EventVideos";
import EventTimeline from "@/components/events/detail/EventTimeline";
import EventSponsors from "@/components/events/detail/EventSponsors";

import { resolveMediaUrl } from "@/lib/media";

type Tab =
  | "overview"
  | "photos"
  | "videos"
  | "timeline"
  | "sponsors";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

export default function EventDetailPage() {
  const params = useParams();

  const eventId = params.id as string;

  const [event, setEvent] =
    useState<Event | null>(null);

  const [photos, setPhotos] =
    useState<EventPhoto[]>([]);

  const [videos, setVideos] =
    useState<EventVideo[]>([]);

  const [timeline, setTimeline] =
    useState<EventTimelineItem[]>([]);

  const [sponsors, setSponsors] =
    useState<EventSponsor[]>([]);

  const [activeTab, setActiveTab] =
    useState<Tab>("overview");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    Promise.all([
      getEventById(eventId),
      getEventPhotos(eventId),
      getEventVideos(eventId),
      getEventTimeline(eventId),
      getEventSponsors(eventId),
    ])
      .then(
        ([
          eventData,
          photoData,
          videoData,
          timelineData,
          sponsorData,
        ]) => {
          setEvent(eventData);
          setPhotos(photoData);
          setVideos(videoData);
          setTimeline(timelineData);
          setSponsors(sponsorData);
        },
      )
      .catch((error) => {
        console.error(
          "Failed to load event:",
          error,
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [eventId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Loading event...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400">
          Event not found.
        </p>

        <Link
          href="/events"
          className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}

      <div>
        <Link
          href="/events"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {event.coverImage && (
            <div className="h-64 overflow-hidden">
              <img
                src={resolveMediaUrl(event.coverImage)}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {event.eventSeries && (
                    <Link
                      href={`/event-series/${event.eventSeries.id}`}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                    >
                      {event.eventSeries.title}
                    </Link>
                  )}

                  {event.category && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {event.category}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {event.title}
                </h1>

                {event.shortDescription && (
                  <p className="mt-2 max-w-3xl text-slate-500 dark:text-slate-400">
                    {event.shortDescription}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    {formatDate(
                      event.eventDate,
                    )}
                  </span>

                  {event.location && (
                    <span className="flex items-center gap-2">
                      <MapPin size={16} />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 gap-3">
                <div className="rounded-xl border border-slate-200 px-4 py-3 text-center dark:border-slate-700">
                  <ImageIcon
                    size={18}
                    className="mx-auto mb-1 text-slate-400 dark:text-slate-500"
                  />

                  <div className="text-xl font-bold">
                    {photos.length}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Photos
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 px-4 py-3 text-center dark:border-slate-700">
                  <Play
                    size={18}
                    className="mx-auto mb-1 text-slate-400 dark:text-slate-500"
                  />

                  <div className="text-xl font-bold">
                    {videos.length}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Videos
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 px-4 py-3 text-center dark:border-slate-700">
                  <CalendarDays
                    size={18}
                    className="mx-auto mb-1 text-slate-400 dark:text-slate-500"
                  />

                  <div className="text-xl font-bold">
                    {timeline.length}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Timeline
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 px-4 py-3 text-center dark:border-slate-700">
                  <Handshake
                    size={18}
                    className="mx-auto mb-1 text-slate-400 dark:text-slate-500"
                  />

                  <div className="text-xl font-bold">
                    {sponsors.length}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Sponsors
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}

      <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
        {[
          ["overview", "Overview"],
          ["photos", "Photos"],
          ["videos", "Videos"],
          ["timeline", "Timeline"],
          ["sponsors", "Sponsors"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setActiveTab(value as Tab)
            }
            className={`rounded-lg px-5 py-2 text-sm font-medium ${
              activeTab === value
                ? "bg-slate-900 text-white dark:bg-blue-600"
                : "text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* CONTENT */}

      {activeTab === "overview" && (
        <EventOverview event={event} />
      )}

      {activeTab === "photos" && (
        <EventPhotos
          eventId={eventId}
          photos={photos}
          onChange={setPhotos}
        />
      )}

      {activeTab === "videos" && (
        <EventVideos
          eventId={eventId}
          videos={videos}
          onChange={setVideos}
        />
      )}

      {activeTab === "timeline" && (
        <EventTimeline
          eventId={eventId}
          timeline={timeline}
          onChange={setTimeline}
        />
      )}

      {activeTab === "sponsors" && (
        <EventSponsors
          eventId={eventId}
          sponsors={sponsors}
          onChange={setSponsors}
        />
      )}
    </div>
  );
}