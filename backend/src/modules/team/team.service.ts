import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrganization() {
    const organization =
      await this.prisma.organization.findUnique({
        where: {
          slug: "stream-nepal",
        },
      });

    if (!organization) {
      throw new NotFoundException(
        "Stream Nepal organization not found",
      );
    }

    return organization;
  }

  async create(createTeamDto: CreateTeamDto) {
    const organization =
      await this.getOrganization();

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

  async findAll() {
    const organization =
      await this.getOrganization();

    return this.prisma.teamMember.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: [
        {
          displayOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }

  async findOne(id: string) {
    const organization =
      await this.getOrganization();

    const member =
      await this.prisma.teamMember.findFirst({
        where: {
          id,
          organizationId: organization.id,
        },
      });

    if (!member) {
      throw new NotFoundException(
        "Team member not found",
      );
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