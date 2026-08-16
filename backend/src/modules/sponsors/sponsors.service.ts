import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrganization() {
    const organization = await this.prisma.organization.findUnique({
      where: {
        slug: 'stream-nepal',
      },
    });

    if (!organization) {
      throw new NotFoundException('Stream Nepal organization not found');
    }

    return organization;
  }

  async create(createSponsorDto: CreateSponsorDto) {
    const organization = await this.getOrganization();

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

  async findAll() {
    const organization = await this.getOrganization();

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

  async findOne(id: string) {
    const organization = await this.getOrganization();

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

  async update(id: string, updateSponsorDto: UpdateSponsorDto) {
    await this.findOne(id);

    return this.prisma.sponsor.update({
      where: {
        id,
      },
      data: updateSponsorDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.sponsor.delete({
      where: {
        id,
      },
    });
  }

  async findPublic() {
    const organization = await this.getOrganization();

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
