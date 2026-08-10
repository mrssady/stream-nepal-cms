import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';
import {
  TournamentStatus,
} from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getStats() {
    const now = new Date();

    const [
      totalUsers,
      owners,
      coOwners,
      admins,
      managers,
      staff,

      totalTeams,
      totalPlayers,
      totalEvents,
      totalRegistrations,

      liveEvents,
      upcomingEvents,
      completedEvents,
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
      totalEvents,
      totalRegistrations,

      liveEvents,
      upcomingEvents,
      completedEvents,
    };
  }
  async getRecentActivity() {
  const [users, tournaments, registrations, teams] =
    await Promise.all([
      this.prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),

      this.prisma.tournament.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),

      this.prisma.registration.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          teamName: true,
          createdAt: true,
        },
      }),

      this.prisma.team.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          teamName: true,
          createdAt: true,
        },
      }),
    ]);

  const activities = [
    ...users.map((user) => ({
      id: `user-${user.id}`,
      type: "user",
      title: "New user registered",
      description: user.name,
      createdAt: user.createdAt,
    })),

    ...tournaments.map((tournament) => ({
      id: `tournament-${tournament.id}`,
      type: "tournament",
      title: "Tournament created",
      description: tournament.name,
      createdAt: tournament.createdAt,
    })),

    ...registrations.map((registration) => ({
      id: `registration-${registration.id}`,
      type: "registration",
      title: "New registration",
      description: registration.teamName,
      createdAt: registration.createdAt,
    })),

    ...teams.map((team) => ({
      id: `team-${team.id}`,
      type: "team",
      title: "Team created",
      description: team.teamName,
      createdAt: team.createdAt,
    })),
  ];

  return activities
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 8);
}
}