import { Injectable, NotFoundException } from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organization: Organization, createSponsorDto: CreateSponsorDto) {
    return this.prisma.sponsor.create({
      data: {
        ...createSponsorDto,
        organization: {
          connect: {
            id: organization.id,
          },
        },
      },
    });
  }

  async findAll(organization: Organization) {
    return this.prisma.sponsor.findMany({
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
    const sponsor = await this.prisma.sponsor.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!sponsor) {
      throw new NotFoundException('Sponsor not found');
    }

    return sponsor;
  }

  async update(
    organization: Organization,
    id: string,
    updateSponsorDto: UpdateSponsorDto,
  ) {
    await this.findOne(organization, id);

    return this.prisma.sponsor.update({
      where: {
        id,
      },
      data: updateSponsorDto,
    });
  }

  async remove(organization: Organization, id: string) {
    await this.findOne(organization, id);

    return this.prisma.sponsor.delete({
      where: {
        id,
      },
    });
  }

  async findPublic(organization: Organization) {
    return this.prisma.sponsor.findMany({
      where: {
        organizationId: organization.id,
        isActive: true,
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
}
