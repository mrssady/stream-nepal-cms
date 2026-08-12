"use client";

import {
  CalendarDays,
  MapPin,
} from "lucide-react";

import type { Event } from "@/services/event";

type EventOverviewProps = {
  event: Event;
};

function formatDate(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

function formatDateTime(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

export default function EventOverview({
  event,
}: EventOverviewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
        <h2 className="text-lg font-semibold">
          About This Event
        </h2>

        <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
          {event.description ||
            "No description added."}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Event Information
        </h2>

        <div className="mt-4 space-y-4 text-sm">
          <div>
            <p className="text-slate-400">
              Organizer
            </p>

            <p className="font-medium">
              {event.organizer || "—"}
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Client
            </p>

            <p className="font-medium">
              {event.client || "—"}
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Location
            </p>

            <p className="flex items-center gap-2 font-medium">
              <MapPin size={15} />
              {event.location || "—"}
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Event Date
            </p>

            <p className="flex items-center gap-2 font-medium">
              <CalendarDays
                size={15}
              />
              {formatDate(
                event.eventDate,
              )}
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Created
            </p>

            <p className="font-medium">
              {formatDateTime(
                event.createdAt,
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}