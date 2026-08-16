import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateTournamentTeamDto } from './dto/create-tournament-team.dto';
import { UpdateTournamentTeamDto } from './dto/update-tournament-team.dto';

@Injectable()
export class TournamentTeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTournamentTeamDto: CreateTournamentTeamDto) {
    const registration = await this.prisma.registration.findUnique({
      where: {
        id: createTournamentTeamDto.registrationId,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const existingTeam = await this.prisma.team.findUnique({
      where: {
        registrationId: createTournamentTeamDto.registrationId,
      },
    });

    if (existingTeam) {
      throw new ConflictException(
        'Tournament team already exists for this registration',
      );
    }

    return this.prisma.team.create({
      data: createTournamentTeamDto,
      include: {
        registration: true,
      },
    });
  }

  async findAll() {
    return this.prisma.team.findMany({
      include: {
        registration: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: {
        id,
      },
      include: {
        registration: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Tournament team not found');
    }

    return team;
  }

  async update(id: string, updateTournamentTeamDto: UpdateTournamentTeamDto) {
    await this.findOne(id);

    if (updateTournamentTeamDto.registrationId) {
      const registration = await this.prisma.registration.findUnique({
        where: {
          id: updateTournamentTeamDto.registrationId,
        },
      });

      if (!registration) {
        throw new NotFoundException('Registration not found');
      }
    }

    return this.prisma.team.update({
      where: {
        id,
      },
      data: updateTournamentTeamDto,
      include: {
        registration: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.team.delete({
      where: {
        id,
      },
    });
  }
}
