import api from "./api";

export interface DashboardStats {
  totalUsers: number;
  owners: number;
  coOwners: number;
  admins: number;
  managers: number;
  staff: number;

  totalTeams: number;
  totalPlayers: number;
  totalEvents: number;
  totalRegistrations: number;

  liveEvents: number;
  upcomingEvents: number;
  completedEvents: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get("/dashboard/stats");

  return response.data.data;
}
export interface DashboardActivity {
  id: string;
  type:
    | "user"
    | "tournament"
    | "registration"
    | "team";
  title: string;
  description: string;
  createdAt: string;
}

export async function getRecentActivity(): Promise<
  DashboardActivity[]
> {
  const response = await api.get(
    "/dashboard/activity",
  );

  return response.data.data;
}