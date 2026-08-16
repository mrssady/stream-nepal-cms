"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BriefcaseBusiness,
  ClipboardPlus,
  FolderKanban,
  GalleryVerticalEnd,
  Handshake,
  History,
  Image,
  Layers3,
  Settings,
  Trophy,
  UserPlus,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

import {
  getRecentActivity,
  type ActivityResource,
  type DashboardActivity,
} from "@/services/dashboard";

const ICONS: Record<
  ActivityResource,
  LucideIcon
> = {
  event: Trophy,
  "event-photo": Image,
  "event-video": Video,
  "event-timeline": History,
  "event-sponsor": Handshake,
  media: GalleryVerticalEnd,
  user: UserPlus,
  project: FolderKanban,
  sponsor: Handshake,
  "event-series": Layers3,
  service: BriefcaseBusiness,
  settings: Settings,
  tournament: Trophy,
  registration: ClipboardPlus,
  team: Users,
};

function getRoute(
  type: ActivityResource,
  resourceId: string | null,
) {
  switch (type) {
    case "event":
      return resourceId
        ? `/events/${resourceId}`
        : "/events";

    case "media":
      return "/gallery";

    case "user":
      return "/users";

    case "project":
      return "/projects";

    case "sponsor":
    case "event-sponsor":
      return "/sponsors";

    case "event-series":
      return "/event-series";

    case "service":
      return "/dashboard/services";

    case "settings":
      return "/settings";

    default:
      return null;
  }
}

const ACTION_STYLES: Record<
  DashboardActivity["action"],
  string
> = {
  CREATE:
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  UPDATE:
    "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  DELETE:
    "bg-destructive/10 text-destructive",
};

const ACTION_LABELS: Record<
  DashboardActivity["action"],
  string
> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
};

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function RecentActivity() {
  const [activities, setActivities] =
    useState<DashboardActivity[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    getRecentActivity()
      .then(setActivities)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-6 py-4">
        <h2 className="font-semibold">
          Recent Activity
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Actions across the CMS from every user.
        </p>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading activity...
          </p>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center">
            <Activity className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              No recent activity
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Actions will appear here as the CMS is used.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {activities.map((activity) => {
              const Icon =
                ICONS[activity.type] ??
                Activity;

              const route = getRoute(
                activity.type,
                activity.resourceId,
              );

              const content = (
                <div className="flex items-start gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${ACTION_STYLES[activity.action]}`}
                      >
                        {
                          ACTION_LABELS[
                            activity.action
                          ]
                        }
                      </span>

                      <p className="text-sm font-medium">
                        {activity.title}
                      </p>
                    </div>

                    <p className="truncate text-sm text-muted-foreground">
                      by{" "}
                      {activity.actorName ??
                        "Unknown user"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatTime(
                        activity.createdAt,
                      )}
                    </p>
                  </div>
                </div>
              );

              if (route) {
                return (
                  <Link
                    key={activity.id}
                    href={route}
                    className="block transition-colors hover:opacity-70"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={activity.id}
                >
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
