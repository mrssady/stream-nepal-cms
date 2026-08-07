"use client";

import {
  CalendarDays,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import StatCard from "@/components/common/StatCard";

export default function DashboardStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Users"
        value={128}
        subtitle="+12 this month"
        icon={Users}
        color="bg-blue-600"
      />

      <StatCard
        title="Teams"
        value={32}
        subtitle="8 Active"
        icon={Shield}
        color="bg-green-600"
      />

      <StatCard
        title="Events"
        value={18}
        subtitle="3 Ongoing"
        icon={Trophy}
        color="bg-orange-500"
      />

      <StatCard
        title="Registrations"
        value={864}
        subtitle="Across tournaments"
        icon={CalendarDays}
        color="bg-purple-600"
      />
    </div>
  );
}