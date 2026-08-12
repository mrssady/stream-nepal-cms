"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Image as ImageIcon,
  MapPin,
  Play,
} from "lucide-react";

import {
  getEventById,
  type Event,
  type EventPhoto,
  type EventTimeline as EventTimelineItem,
  type EventVideo,
} from "@/services/event";

import {
  getEventPhotos,
  getEventTimeline,
  getEventVideos,
} from "@/services/event-content";

import EventOverview from "@/components/events/detail/EventOverview";
import EventPhotos from "@/components/events/detail/EventPhotos";
import EventVideos from "@/components/events/detail/EventVideos";
import EventTimeline from "@/components/events/detail/EventTimeline";

type Tab =
  | "overview"
  | "photos"
  | "videos"
  | "timeline";

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

  const [activeTab, setActiveTab] =
    useState<Tab>("overview");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);

        const [
          eventData,
          photoData,
          videoData,
          timelineData,
        ] = await Promise.all([
          getEventById(eventId),
          getEventPhotos(eventId),
          getEventVideos(eventId),
          getEventTimeline(eventId),
        ]);

        setEvent(eventData);
        setPhotos(photoData);
        setVideos(videoData);
        setTimeline(timelineData);
      } catch (error) {
        console.error(
          "Failed to load event:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      void loadEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="p-6">
        Loading event...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Event not found.
        </p>

        <Link
          href="/events"
          className="mt-4 inline-flex items-center gap-2 text-blue-600"
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
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>

        <div className="overflow-hidden rounded-2xl border bg-white">
          {event.coverImage && (
            <div className="h-64 overflow-hidden">
              <img
                src={event.coverImage}
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
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      {event.eventSeries.title}
                    </Link>
                  )}

                  {event.category && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {event.category}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-slate-900">
                  {event.title}
                </h1>

                {event.shortDescription && (
                  <p className="mt-2 max-w-3xl text-slate-500">
                    {event.shortDescription}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
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
                <div className="rounded-xl border px-4 py-3 text-center">
                  <ImageIcon
                    size={18}
                    className="mx-auto mb-1 text-slate-400"
                  />

                  <div className="text-xl font-bold">
                    {photos.length}
                  </div>

                  <div className="text-xs text-slate-500">
                    Photos
                  </div>
                </div>

                <div className="rounded-xl border px-4 py-3 text-center">
                  <Play
                    size={18}
                    className="mx-auto mb-1 text-slate-400"
                  />

                  <div className="text-xl font-bold">
                    {videos.length}
                  </div>

                  <div className="text-xs text-slate-500">
                    Videos
                  </div>
                </div>

                <div className="rounded-xl border px-4 py-3 text-center">
                  <CalendarDays
                    size={18}
                    className="mx-auto mb-1 text-slate-400"
                  />

                  <div className="text-xl font-bold">
                    {timeline.length}
                  </div>

                  <div className="text-xs text-slate-500">
                    Timeline
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}

      <div className="flex overflow-x-auto rounded-xl border bg-white p-1">
        {[
          ["overview", "Overview"],
          ["photos", "Photos"],
          ["videos", "Videos"],
          ["timeline", "Timeline"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setActiveTab(value as Tab)
            }
            className={`rounded-lg px-5 py-2 text-sm font-medium ${
              activeTab === value
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
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
    </div>
  );
}