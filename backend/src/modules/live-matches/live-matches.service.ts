import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateLiveMatchDto } from './dto/create-live-match.dto';
import { UpdateLiveMatchDto } from './dto/update-live-match.dto';

@Injectable()
export class LiveMatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLiveMatchDto: CreateLiveMatchDto) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: createLiveMatchDto.tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const existing = await this.prisma.liveMatch.findUnique({
      where: {
        tournamentId_matchNumber: {
          tournamentId: createLiveMatchDto.tournamentId,
          matchNumber: createLiveMatchDto.matchNumber,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'A live match with this match number already exists in the tournament',
      );
    }

    return this.prisma.liveMatch.create({
      data: {
        name: createLiveMatchDto.name,
        tournamentId: createLiveMatchDto.tournamentId,
        matchNumber: createLiveMatchDto.matchNumber,
        round: createLiveMatchDto.round,
        notes: createLiveMatchDto.notes,
      },
    });
  }

  async findAll(tournamentId?: string) {
    return this.prisma.liveMatch.findMany({
      where: tournamentId ? { tournamentId } : undefined,
      orderBy: [{ matchNumber: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.liveMatch.findUnique({ where: { id } });

    if (!match) {
      throw new NotFoundException('Live match not found');
    }

    return match;
  }

  async update(id: string, updateLiveMatchDto: UpdateLiveMatchDto) {
    await this.findOne(id);

    return this.prisma.liveMatch.update({
      where: { id },
      data: updateLiveMatchDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.liveMatch.delete({ where: { id } });
  }
}
