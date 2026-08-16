import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlayerDto: CreatePlayerDto) {
    const team = await this.prisma.team.findUnique({
      where: {
        id: createPlayerDto.teamId,
      },
    });

    if (!team) {
      throw new NotFoundException('Tournament team not found');
    }

    const existingPlayer = await this.prisma.player.findFirst({
      where: {
        teamId: createPlayerDto.teamId,
        gameUID: createPlayerDto.gameUID,
      },
    });

    if (existingPlayer) {
      throw new ConflictException('Player already exists in this team');
    }

    return this.prisma.player.create({
      data: createPlayerDto,
      include: {
        team: true,
      },
    });
  }

  async findAll() {
    return this.prisma.player.findMany({
      include: {
        team: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const player = await this.prisma.player.findUnique({
      where: {
        id,
      },
      include: {
        team: true,
      },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return player;
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto) {
    await this.findOne(id);

    if (updatePlayerDto.teamId) {
      const team = await this.prisma.team.findUnique({
        where: {
          id: updatePlayerDto.teamId,
        },
      });

      if (!team) {
        throw new NotFoundException('Tournament team not found');
      }
    }

    return this.prisma.player.update({
      where: {
        id,
      },
      data: updatePlayerDto,
      include: {
        team: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.player.delete({
      where: {
        id,
      },
    });
  }
}
