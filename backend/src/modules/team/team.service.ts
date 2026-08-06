import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto) {
    return this.prisma.teamMember.create({
      data: createTeamDto,
    });
  }

  async findAll() {
    return this.prisma.teamMember.findMany({
      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: {
        id,
      },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    return member;
  }

  async update(
    id: string,
    updateTeamDto: UpdateTeamDto,
  ) {
    await this.findOne(id);

    return this.prisma.teamMember.update({
      where: {
        id,
      },
      data: updateTeamDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.teamMember.delete({
      where: {
        id,
      },
    });
  }
}