import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMatchDto: CreateMatchDto) {
    const tournament = await this.prisma.tournament.findUnique({
      where: {
        id: createMatchDto.tournamentId,
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const homeTeam = await this.prisma.team.findUnique({
      where: {
        id: createMatchDto.homeTeamId,
      },
    });

    if (!homeTeam) {
      throw new NotFoundException('Home team not found');
    }

    const awayTeam = await this.prisma.team.findUnique({
      where: {
        id: createMatchDto.awayTeamId,
      },
    });

    if (!awayTeam) {
      throw new NotFoundException('Away team not found');
    }

    if (createMatchDto.homeTeamId === createMatchDto.awayTeamId) {
      throw new BadRequestException(
        'Home team and Away team cannot be the same',
      );
    }

    return this.prisma.match.create({
      data: {
        ...createMatchDto,
        scheduledAt: new Date(createMatchDto.scheduledAt),
      },
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
      },
    });
  }

  async findAll() {
    return this.prisma.match.findMany({
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: {
        id,
      },
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  async update(
    id: string,
    updateMatchDto: UpdateMatchDto,
  ) {
    await this.findOne(id);

    const data: any = {
      ...updateMatchDto,
    };

    if (updateMatchDto.scheduledAt) {
      data.scheduledAt = new Date(
        updateMatchDto.scheduledAt,
      );
    }

    return this.prisma.match.update({
      where: {
        id,
      },
      data,
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.match.delete({
      where: {
        id,
      },
    });
  }
}