"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  FolderKanban,
  GalleryVerticalEnd,
  Gamepad2,
  Handshake,
  Layers3,
  Trophy,
  Users,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";

import {
  getDashboardStats,
  type DashboardStats,
  type TrendPoint,
} from "@/services/dashboard";

import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ChartCard from "@/components/dashboard/charts/ChartCard";
import ActivityAreaChart from "@/components/dashboard/charts/ActivityAreaChart";
import BarTrendChart from "@/components/dashboard/charts/BarTrendChart";
import DistributionDonut from "@/components/dashboard/charts/DistributionDonut";

function greeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function todayLabel() {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function splitHalves(trend: TrendPoint[]) {
  if (trend.length < 2) {
    return { current: 0, previous: 0 };
  }

  const split = Math.floor(trend.length / 2);

  const current = trend
    .slice(split)
    .reduce((sum, point) => sum + point.count, 0);

  const previous = trend
    .slice(0, split)
    .reduce((sum, point) => sum + point.count, 0);

  return { current, previous };
}

function lastTwoPoints(trend: TrendPoint[]) {
  if (trend.length < 2) {
    return { current: 0, previous: 0 };
  }

  return {
    current: trend[trend.length - 1].count,
    previous: trend[trend.length - 2].count,
  };
}

function TrendBadge({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous <= 0) {
    if (current <= 0) {
      return null;
    }

    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        <ArrowUpRight className="size-3" />
        New
      </span>
    );
  }

  const change = Math.round(
    ((current - previous) / previous) * 100,
  );

  const positive = change >= 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
        positive
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-destructive/10 text-destructive"
      }`}
    >
      <ArrowUpRight
        className={`size-3 ${positive ? "" : "rotate-90"}`}
      />
      {positive ? "+" : ""}
      {change}%
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

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

  const activityDelta = useMemo(
    () =>
      stats
        ? splitHalves(stats.activityTrend)
        : null,
    [stats],
  );

  const registrationDelta = useMemo(
    () =>
      stats
        ? lastTwoPoints(stats.registrationsTrend)
        : null,
    [stats],
  );

  const eventDelta = useMemo(
    () =>
      stats
        ? lastTwoPoints(stats.portfolioEventsTrend)
        : null,
    [stats],
  );

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 p-6 text-destructive">
        {error}
      </div>
    );
  }

  const firstName =
    user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      {/* Greeting */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}, {firstName}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {todayLabel()} — here is what is
            happening with your content.
          </p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Manage events
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      {/* Key metrics */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Portfolio Events"
          value={stats?.totalPortfolioEvents}
          description={`${stats?.activePortfolioEvents ?? 0} active`}
          icon={Trophy}
          href="/events"
          trend={eventDelta ?? undefined}
        />

        <KpiCard
          title="Tournaments"
          value={stats?.totalEvents}
          description={`${stats?.liveEvents ?? 0} live right now`}
          icon={Gamepad2}
        />

        <KpiCard
          title="Users"
          value={stats?.totalUsers}
          description={`${stats?.staff ?? 0} staff members`}
          icon={Users}
          href="/users"
        />

        <KpiCard
          title="Registrations"
          value={stats?.totalRegistrations}
          description="Across tournaments"
          icon={CalendarDays}
          trend={registrationDelta ?? undefined}
        />
      </div>

      {/* Charts */}

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Activity Trend"
          subtitle="CMS actions over the last 14 days"
          action={
            activityDelta ? (
              <TrendBadge
                current={activityDelta.current}
                previous={activityDelta.previous}
              />
            ) : null
          }
        >
          <ActivityAreaChart
            data={stats?.activityTrend ?? []}
          />
        </ChartCard>

        <ChartCard
          title="Tournament Status"
          subtitle="Breakdown by current status"
        >
          <DistributionDonut
            data={
              stats?.tournamentStatusDistribution ??
              []
            }
            totalLabel="Tournaments"
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Portfolio Events"
          subtitle="Events scheduled per month, last 12 months"
          action={
            eventDelta ? (
              <TrendBadge
                current={eventDelta.current}
                previous={eventDelta.previous}
              />
            ) : null
          }
        >
          <BarTrendChart
            data={stats?.portfolioEventsTrend ?? []}
            label="Events"
            color="var(--chart-4)"
          />
        </ChartCard>

        <ChartCard
          title="Registrations"
          subtitle="Weekly registrations, last 12 weeks"
          action={
            registrationDelta ? (
              <TrendBadge
                current={registrationDelta.current}
                previous={registrationDelta.previous}
              />
            ) : null
          }
        >
          <BarTrendChart
            data={stats?.registrationsTrend ?? []}
            label="Registrations"
            color="var(--chart-3)"
          />
        </ChartCard>
      </div>

      {/* Content library */}

      <div>
        <h2 className="text-base font-semibold">
          Content Library
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Everything managed through the CMS.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <ContentStat
            label="Projects"
            value={stats?.totalProjects}
            icon={FolderKanban}
            href="/projects"
          />

          <ContentStat
            label="Services"
            value={stats?.totalServices}
            icon={BriefcaseBusiness}
            href="/dashboard/services"
          />

          <ContentStat
            label="Media files"
            value={stats?.totalMedia}
            icon={GalleryVerticalEnd}
            href="/gallery"
          />

          <ContentStat
            label="Sponsors"
            value={stats?.totalSponsors}
            icon={Handshake}
            href="/sponsors"
          />

          <ContentStat
            label="Event series"
            value={stats?.totalEventSeries}
            icon={Layers3}
            href="/event-series"
          />

          <ContentStat
            label="Team members"
            value={stats?.totalTeamMembers}
            icon={Users}
          />
        </div>
      </div>

      {/* Activity + quick actions */}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentActivity />
        </div>

        <QuickActions />
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  trend,
}: {
  title: string;
  value?: number;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  href?: string;
  trend?: { current: number; previous: number };
}) {
  const content = (
    <div className="flex h-full items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">
          {title}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <p className="text-3xl font-semibold tracking-tight">
            {value ?? "—"}
          </p>

          {trend ? (
            <TrendBadge
              current={trend.current}
              previous={trend.previous}
            />
          ) : null}
        </div>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
    </div>
  );

  const classes =
    "group flex h-full rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40";

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

function ContentStat({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value?: number;
  icon: React.ComponentType<{
    className?: string;
  }>;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xl font-semibold leading-tight">
          {value ?? "—"}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {label}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      {content}
    </div>
  );
}
