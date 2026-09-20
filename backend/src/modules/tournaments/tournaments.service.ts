import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { CreatePublicRegistrationDto } from './dto/create-public-registration.dto';

@Injectable()
export class TournamentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTournamentDto: CreateTournamentDto) {
    const existingTournament = await this.prisma.tournament.findUnique({
      where: {
        slug: createTournamentDto.slug,
      },
    });

    if (existingTournament) {
      throw new ConflictException('Tournament slug already exists');
    }

    return this.prisma.tournament.create({
      data: {
        ...createTournamentDto,
        registrationOpen: new Date(createTournamentDto.registrationOpen),
        registrationClose: new Date(createTournamentDto.registrationClose),
        tournamentStart: new Date(createTournamentDto.tournamentStart),
        tournamentEnd: new Date(createTournamentDto.tournamentEnd),
      },
    });
  }

  async findAll() {
    return this.prisma.tournament.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: {
        id,
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return tournament;
  }

  async update(id: string, updateTournamentDto: UpdateTournamentDto) {
    await this.findOne(id);

    if (updateTournamentDto.slug) {
      const existingTournament = await this.prisma.tournament.findUnique({
        where: {
          slug: updateTournamentDto.slug,
        },
      });

      if (existingTournament && existingTournament.id !== id) {
        throw new ConflictException('Tournament slug already exists');
      }
    }

    const data: any = {
      ...updateTournamentDto,
    };

    if (updateTournamentDto.registrationOpen) {
      data.registrationOpen = new Date(updateTournamentDto.registrationOpen);
    }

    if (updateTournamentDto.registrationClose) {
      data.registrationClose = new Date(updateTournamentDto.registrationClose);
    }

    if (updateTournamentDto.tournamentStart) {
      data.tournamentStart = new Date(updateTournamentDto.tournamentStart);
    }

    if (updateTournamentDto.tournamentEnd) {
      data.tournamentEnd = new Date(updateTournamentDto.tournamentEnd);
    }

    return this.prisma.tournament.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.tournament.delete({
      where: {
        id,
      },
    });
  }
  async findPublic() {
    return this.prisma.tournament.findMany({
      where: {
        isPublic: true,
      },
      orderBy: [
        {
          featured: 'desc',
        },
        {
          tournamentStart: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async findPublicBySlug(slug: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: {
        slug,
      },
      include: {
        registrations: {
          where: {
            registrationStatus: 'APPROVED',
          },
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            team: {
              select: {
                id: true,
                shortName: true,
                slotNumber: true,
                status: true,
              },
            },
          },
        },
        matches: {
          include: {
            homeTeam: {
              select: {
                id: true,
                teamName: true,
                shortName: true,
                teamLogo: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                teamName: true,
                shortName: true,
                teamLogo: true,
              },
            },
          },
          orderBy: {
            scheduledAt: 'asc',
          },
        },
        liveMatches: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            name: true,
            matchNumber: true,
            round: true,
            status: true,
          },
        },
      },
    });

    if (!tournament || !tournament.isPublic) {
      throw new NotFoundException('Tournament not found');
    }

    return {
      ...tournament,
      registrations: tournament.registrations.map((registration) => ({
        id: registration.id,
        teamName: registration.teamName,
        teamLogo: registration.teamLogo,
        slotNumber: registration.team?.slotNumber ?? null,
        shortName: registration.team?.shortName ?? null,
        teamStatus: registration.team?.status ?? null,
        createdAt: registration.createdAt,
      })),
      matches: tournament.matches.map((match) => ({
        id: match.id,
        title: match.title,
        round: match.round,
        matchType: match.matchType,
        status: match.status,
        scheduledAt: match.scheduledAt,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        winnerTeamId: match.winnerTeamId,
        homeTeam: {
          id: match.homeTeam.id,
          teamName: match.homeTeam.teamName,
          shortName: match.homeTeam.shortName,
          teamLogo: match.homeTeam.teamLogo,
        },
        awayTeam: {
          id: match.awayTeam.id,
          teamName: match.awayTeam.teamName,
          shortName: match.awayTeam.shortName,
          teamLogo: match.awayTeam.teamLogo,
        },
      })),
      liveMatch: tournament.liveMatches[0] ?? null,
    };
  }

  async registerPublic(
    slug: string,
    createPublicRegistrationDto: CreatePublicRegistrationDto,
  ) {
    const tournament = await this.prisma.tournament.findUnique({
      where: {
        slug,
      },
    });

    if (!tournament || !tournament.isPublic) {
      throw new NotFoundException('Tournament not found');
    }

    if (
      tournament.status === 'CANCELLED' ||
      tournament.status === 'COMPLETED' ||
      tournament.status === 'DRAFT'
    ) {
      throw new BadRequestException(
        'This tournament is not accepting registrations',
      );
    }

    const now = new Date();

    if (now < tournament.registrationOpen) {
      throw new BadRequestException(
        'Registration for this tournament has not opened yet',
      );
    }

    if (now > tournament.registrationClose) {
      throw new BadRequestException(
        'Registration for this tournament has closed',
      );
    }

    if (tournament.currentTeams >= tournament.maxTeams) {
      throw new BadRequestException(
        'This tournament has reached its team limit',
      );
    }

    const existingRegistration = await this.prisma.registration.findFirst({
      where: {
        tournamentId: tournament.id,
        teamName: createPublicRegistrationDto.teamName,
      },
    });

    if (existingRegistration) {
      throw new ConflictException(
        'A team with this name has already registered for this tournament',
      );
    }

    return this.prisma.registration.create({
      data: {
        tournamentId: tournament.id,
        teamName: createPublicRegistrationDto.teamName,
        captainName: createPublicRegistrationDto.captainName,
        captainEmail: createPublicRegistrationDto.captainEmail,
        captainPhone: createPublicRegistrationDto.captainPhone,
        managerName: createPublicRegistrationDto.managerName,
        managerPhone: createPublicRegistrationDto.managerPhone,
        discordUsername: createPublicRegistrationDto.discordUsername,
        gameUID: createPublicRegistrationDto.gameUID,
        gameIGN: createPublicRegistrationDto.gameIGN,
        rosterSize: createPublicRegistrationDto.rosterSize,
        paymentStatus: 'UNPAID',
        registrationStatus: 'PENDING',
      },
    });
  }
}
