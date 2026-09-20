import { Injectable, NotFoundException } from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organization: Organization, createTeamDto: CreateTeamDto) {
    return this.prisma.teamMember.create({
      data: {
        ...createTeamDto,
        organization: {
          connect: {
            id: organization.id,
          },
        },
      },
    });
  }

  async findAll(organization: Organization) {
    return this.prisma.teamMember.findMany({
      where: {
        organizationId: organization.id,
      },
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

  async findOne(organization: Organization, id: string) {
    const member = await this.prisma.teamMember.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    return member;
  }

  async update(
    organization: Organization,
    id: string,
    updateTeamDto: UpdateTeamDto,
  ) {
    await this.findOne(organization, id);

    return this.prisma.teamMember.update({
      where: {
        id,
      },
      data: updateTeamDto,
    });
  }

  async remove(organization: Organization, id: string) {
    await this.findOne(organization, id);

    return this.prisma.teamMember.delete({
      where: {
        id,
      },
    });
  }
}
