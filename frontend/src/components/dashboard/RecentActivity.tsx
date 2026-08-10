"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  Trophy,
  Users,
  ClipboardPlus,
  Activity,
} from "lucide-react";

import {
  getRecentActivity,
  type DashboardActivity,
} from "@/services/dashboard";

function getIcon(type: DashboardActivity["type"]) {
  switch (type) {
    case "user":
      return UserPlus;

    case "tournament":
      return Trophy;

    case "registration":
      return ClipboardPlus;

    case "team":
      return Users;

    default:
      return Activity;
  }
}

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
          Latest activity across the CMS.
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
              Activity will appear here as the CMS is used.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {activities.map((activity) => {
              const Icon = getIcon(activity.type);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {activity.title}
                    </p>

                    <p className="truncate text-sm text-muted-foreground">
                      {activity.description}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}