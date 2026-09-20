import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';
import { TournamentStatus, type Organization } from '@prisma/client';

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function monthLabel(year: number, month: number) {
  const date = new Date(year, month, 1);

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function weekLabel(monday: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(monday);
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(organization: Organization) {
    const now = new Date();
    const organizationId = organization.id;

    const [
      totalUsers,
      owners,
      coOwners,
      admins,
      managers,
      staff,

      totalTeams,
      totalPlayers,
      totalTournaments,
      totalRegistrations,

      liveEvents,
      upcomingEvents,
      completedEvents,

      totalProjects,
      totalServices,
      totalMedia,
      totalSponsors,
      totalTeamMembers,
      totalEventSeries,
      totalPortfolioEvents,
      activePortfolioEvents,
      featuredPortfolioEvents,

      eventCategories,
      projectCategories,
      sponsorTiers,
      mediaPlatforms,
      tournamentStatuses,
    ] = await Promise.all([
      // Users
      this.prisma.user.count(),

      this.prisma.user.count({
        where: {
          role: Role.OWNER,
        },
      }),

      this.prisma.user.count({
        where: {
          role: Role.CO_OWNER,
        },
      }),

      this.prisma.user.count({
        where: {
          role: Role.ADMIN,
        },
      }),

      this.prisma.user.count({
        where: {
          role: Role.MANAGER,
        },
      }),

      this.prisma.user.count({
        where: {
          role: Role.STAFF,
        },
      }),

      // Tournament system
      this.prisma.team.count(),

      this.prisma.player.count(),

      this.prisma.tournament.count(),

      this.prisma.registration.count(),

      // Live events
      this.prisma.tournament.count({
        where: {
          status: TournamentStatus.LIVE,
        },
      }),

      // Upcoming events
      this.prisma.tournament.count({
        where: {
          tournamentStart: {
            gt: now,
          },
          status: {
            in: [
              TournamentStatus.PUBLISHED,
              TournamentStatus.REGISTRATION_OPEN,
              TournamentStatus.REGISTRATION_CLOSED,
            ],
          },
        },
      }),

      // Completed events
      this.prisma.tournament.count({
        where: {
          status: TournamentStatus.COMPLETED,
        },
      }),

      // Portfolio content
      this.prisma.project.count({
        where: { organizationId },
      }),

      this.prisma.service.count({
        where: { organizationId },
      }),

      this.prisma.media.count({
        where: { organizationId },
      }),

      this.prisma.sponsor.count({
        where: { organizationId },
      }),

      this.prisma.teamMember.count({
        where: { organizationId },
      }),

      this.prisma.eventSeries.count({
        where: { organizationId },
      }),

      this.prisma.event.count({
        where: { organizationId },
      }),

      this.prisma.event.count({
        where: { organizationId, isActive: true },
      }),

      this.prisma.event.count({
        where: { organizationId, featured: true },
      }),

      // Distributions
      this.prisma.event.groupBy({
        by: ['category'],
        where: {
          organizationId,
          category: { not: null },
        },
        _count: {
          _all: true,
        },
      }),

      this.prisma.project.groupBy({
        by: ['category'],
        where: {
          organizationId,
          category: { not: null },
        },
        _count: {
          _all: true,
        },
      }),

      this.prisma.sponsor.groupBy({
        by: ['tier'],
        where: { organizationId },
        _count: {
          _all: true,
        },
      }),

      this.prisma.media.groupBy({
        by: ['platform'],
        where: { organizationId },
        _count: {
          _all: true,
        },
      }),

      this.prisma.tournament.groupBy({
        by: ['status'],
        _count: {
          _all: true,
        },
      }),
    ]);

    const [activityTrend, registrationsTrend, portfolioEventsTrend] =
      await Promise.all([
        this.getActivityTrend(now),
        this.getRegistrationsTrend(now),
        this.getPortfolioEventsTrend(now, organizationId),
      ]);

    return {
      totalUsers,
      owners,
      coOwners,
      admins,
      managers,
      staff,

      totalTeams,
      totalPlayers,
      totalEvents: totalTournaments,
      totalRegistrations,

      liveEvents,
      upcomingEvents,
      completedEvents,

      totalProjects,
      totalServices,
      totalMedia,
      totalSponsors,
      totalTeamMembers,
      totalEventSeries,
      totalPortfolioEvents,
      activePortfolioEvents,
      featuredPortfolioEvents,

      userRoleDistribution: [
        { role: 'OWNER', count: owners },
        { role: 'CO_OWNER', count: coOwners },
        { role: 'ADMIN', count: admins },
        { role: 'MANAGER', count: managers },
        { role: 'STAFF', count: staff },
      ].filter((entry) => entry.count > 0),

      eventCategoryDistribution: eventCategories.map((entry) => ({
        label: entry.category ?? 'Uncategorized',
        count: entry._count._all,
      })),

      projectCategoryDistribution: projectCategories.map((entry) => ({
        label: entry.category ?? 'Uncategorized',
        count: entry._count._all,
      })),

      sponsorTierDistribution: sponsorTiers.map((entry) => ({
        label: entry.tier,
        count: entry._count._all,
      })),

      mediaPlatformDistribution: mediaPlatforms.map((entry) => ({
        label: entry.platform,
        count: entry._count._all,
      })),

      tournamentStatusDistribution: tournamentStatuses.map((entry) => ({
        label: entry.status,
        count: entry._count._all,
      })),

      activityTrend,
      registrationsTrend,
      portfolioEventsTrend,
    };
  }

  private async getActivityTrend(now: Date) {
    const start = new Date(now);
    start.setDate(start.getDate() - 13);
    start.setHours(0, 0, 0, 0);

    const logs = await this.prisma.activityLog.findMany({
      where: {
        createdAt: {
          gte: start,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const buckets = new Map<string, number>();

    for (let index = 0; index < 14; index += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + index);

      buckets.set(dateKey(day), 0);
    }

    for (const log of logs) {
      const key = dateKey(new Date(log.createdAt));

      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) as number) + 1);
      }
    }

    return [...buckets.entries()].map(([date, count]) => ({
      date,
      count,
    }));
  }

  private async getRegistrationsTrend(now: Date) {
    const current = new Date(now);

    const currentMonday = new Date(current);
    currentMonday.setDate(current.getDate() - ((current.getDay() + 6) % 7));
    currentMonday.setHours(0, 0, 0, 0);

    const start = new Date(currentMonday);
    start.setDate(start.getDate() - 77);

    const registrations = await this.prisma.registration.findMany({
      where: {
        createdAt: {
          gte: start,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const buckets = new Map<string, number>();
    const order: string[] = [];

    for (let index = 0; index < 12; index += 1) {
      const monday = new Date(currentMonday);
      monday.setDate(currentMonday.getDate() - (11 - index) * 7);

      const key = dateKey(monday);
      order.push(key);
      buckets.set(key, 0);
    }

    for (const registration of registrations) {
      const createdAt = new Date(registration.createdAt);
      const offset = ((createdAt.getDay() + 6) % 7) * 86400000;
      const monday = new Date(createdAt.getTime() - offset);
      monday.setHours(0, 0, 0, 0);

      const key = dateKey(monday);

      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) as number) + 1);
      }
    }

    return order.map((key) => ({
      label: weekLabel(new Date(`${key}T00:00:00`)),
      count: buckets.get(key) as number,
    }));
  }

  private async getPortfolioEventsTrend(now: Date, organizationId: string) {
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const events = await this.prisma.event.findMany({
      where: {
        organizationId,
        eventDate: {
          gte: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() - 11,
            1,
          ),
        },
      },
      select: {
        eventDate: true,
      },
    });

    const buckets = new Map<string, number>();
    const order: string[] = [];

    for (let index = 11; index >= 0; index -= 1) {
      const month = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - index,
        1,
      );

      const key = `${month.getFullYear()}-${String(
        month.getMonth() + 1,
      ).padStart(2, '0')}`;

      order.push(key);
      buckets.set(key, 0);
    }

    for (const event of events) {
      const date = new Date(event.eventDate);

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}`;

      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) as number) + 1);
      }
    }

    return order.map((key) => {
      const [year, month] = key.split('-').map(Number);

      return {
        label: monthLabel(year, month - 1),
        count: buckets.get(key) as number,
      };
    });
  }

  async getRecentActivity() {
    const logs = await this.prisma.activityLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 12,
    });

    return logs.map((log) => ({
      id: log.id,
      type: log.resource,
      action: log.action,
      title: log.summary,
      description: `by ${log.actorName ?? 'Unknown user'}`,
      actorName: log.actorName,
      actorId: log.actorId,
      resourceId: log.resourceId,
      createdAt: log.createdAt,
    }));
  }
}
