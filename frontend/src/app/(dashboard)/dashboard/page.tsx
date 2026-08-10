"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gamepad2,
  Trophy,
  Users,
} from "lucide-react";

import {
  getDashboardStats,
  type DashboardStats,
} from "@/services/dashboard";

import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            "Failed to load dashboard statistics.",
        );
      });
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 p-6 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your Stream Nepal CMS.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Events"
          value={stats?.totalEvents}
          description={`${stats?.liveEvents ?? 0} live`}
          icon={Trophy}
        />

        <StatCard
          title="Teams"
          value={stats?.totalTeams}
          description={`${stats?.totalPlayers ?? 0} players`}
          icon={Gamepad2}
        />

        <StatCard
          title="Registrations"
          value={stats?.totalRegistrations}
          description="Across tournaments"
          icon={CalendarDays}
        />

        <StatCard
          title="Users"
          value={stats?.totalUsers}
          description={`${stats?.staff ?? 0} staff`}
          icon={Users}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <OverviewCard
          title="Live Events"
          value={stats?.liveEvents}
          icon={Gamepad2}
        />

        <OverviewCard
          title="Upcoming Events"
          value={stats?.upcomingEvents}
          icon={Clock3}
        />

        <OverviewCard
          title="Completed Events"
          value={stats?.completedEvents}
          icon={CheckCircle2}
        />
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">
          User Overview
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <RoleStat label="Owners" value={stats?.owners} />
          <RoleStat label="Co-Owners" value={stats?.coOwners} />
          <RoleStat label="Admins" value={stats?.admins} />
          <RoleStat label="Managers" value={stats?.managers} />
          <RoleStat label="Staff" value={stats?.staff} />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
  <RecentActivity />

  <QuickActions />
</div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value?: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-3 text-3xl font-semibold">
            {value ?? "—"}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value?: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-5" />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="text-2xl font-semibold">
            {value ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleStat({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold">
        {value ?? "—"}
      </p>
    </div>
  );
}