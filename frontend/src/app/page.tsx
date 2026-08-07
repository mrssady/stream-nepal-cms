import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back to Stream Nepal CMS.
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentActivity />

        <QuickActions />
      </div>
    </div>
  );
}