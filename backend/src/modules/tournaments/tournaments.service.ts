import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Injectable()
export class TournamentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTournamentDto: CreateTournamentDto) {
    const existingTournament =
      await this.prisma.tournament.findUnique({
        where: {
          slug: createTournamentDto.slug,
        },
      });

    if (existingTournament) {
      throw new ConflictException(
        'Tournament slug already exists',
      );
    }

    return this.prisma.tournament.create({
      data: {
        ...createTournamentDto,
        registrationOpen: new Date(
          createTournamentDto.registrationOpen,
        ),
        registrationClose: new Date(
          createTournamentDto.registrationClose,
        ),
        tournamentStart: new Date(
          createTournamentDto.tournamentStart,
        ),
        tournamentEnd: new Date(
          createTournamentDto.tournamentEnd,
        ),
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
    const tournament =
      await this.prisma.tournament.findUnique({
        where: {
          id,
        },
      });

    if (!tournament) {
      throw new NotFoundException(
        'Tournament not found',
      );
    }

    return tournament;
  }

  async update(
    id: string,
    updateTournamentDto: UpdateTournamentDto,
  ) {
    await this.findOne(id);

    if (updateTournamentDto.slug) {
      const existingTournament =
        await this.prisma.tournament.findUnique({
          where: {
            slug: updateTournamentDto.slug,
          },
        });

      if (
        existingTournament &&
        existingTournament.id !== id
      ) {
        throw new ConflictException(
          'Tournament slug already exists',
        );
      }
    }

    const data: any = {
      ...updateTournamentDto,
    };

    if (updateTournamentDto.registrationOpen) {
      data.registrationOpen = new Date(
        updateTournamentDto.registrationOpen,
      );
    }

    if (updateTournamentDto.registrationClose) {
      data.registrationClose = new Date(
        updateTournamentDto.registrationClose,
      );
    }

    if (updateTournamentDto.tournamentStart) {
      data.tournamentStart = new Date(
        updateTournamentDto.tournamentStart,
      );
    }

    if (updateTournamentDto.tournamentEnd) {
      data.tournamentEnd = new Date(
        updateTournamentDto.tournamentEnd,
      );
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
}
