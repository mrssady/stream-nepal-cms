import api from "./api";

export interface DistributionEntry {
  label: string;
  count: number;
}

export interface TrendPoint {
  date?: string;
  label?: string;
  count: number;
}

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

  totalProjects: number;
  totalServices: number;
  totalMedia: number;
  totalSponsors: number;
  totalTeamMembers: number;
  totalEventSeries: number;
  totalPortfolioEvents: number;
  activePortfolioEvents: number;
  featuredPortfolioEvents: number;

  userRoleDistribution: DistributionEntry[];
  eventCategoryDistribution: DistributionEntry[];
  projectCategoryDistribution: DistributionEntry[];
  sponsorTierDistribution: DistributionEntry[];
  mediaPlatformDistribution: DistributionEntry[];
  tournamentStatusDistribution: DistributionEntry[];

  activityTrend: TrendPoint[];
  registrationsTrend: TrendPoint[];
  portfolioEventsTrend: TrendPoint[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get("/dashboard/stats");

  return response.data.data;
}
export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE";

export type ActivityResource =
  | "event"
  | "event-photo"
  | "event-video"
  | "event-timeline"
  | "event-sponsor"
  | "media"
  | "user"
  | "project"
  | "sponsor"
  | "event-series"
  | "service"
  | "settings"
  | "tournament"
  | "registration"
  | "team";

export interface DashboardActivity {
  id: string;
  type: ActivityResource;
  action: ActivityAction;
  title: string;
  description: string;
  actorName: string | null;
  actorId: string | null;
  resourceId: string | null;
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