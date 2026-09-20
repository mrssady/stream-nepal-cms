import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organization: Organization, createMediaDto: CreateMediaDto) {
    const existing = await this.prisma.media.findFirst({
      where: {
        organizationId: organization.id,
        sourceUrl: createMediaDto.sourceUrl,
      },
    });

    if (existing) {
      throw new ConflictException('This media URL already exists');
    }

    return this.prisma.media.create({
      data: {
        ...createMediaDto,
        organization: {
          connect: {
            id: organization.id,
          },
        },
      },
    });
  }

  async findAll(organization: Organization) {
    return this.prisma.media.findMany({
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

  async findPublic(organization: Organization) {
    return this.prisma.media.findMany({
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

  async findOne(organization: Organization, id: string) {
    const media = await this.prisma.media.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async update(
    organization: Organization,
    id: string,
    updateMediaDto: UpdateMediaDto,
  ) {
    const media = await this.findOne(organization, id);

    if (updateMediaDto.sourceUrl) {
      const existing = await this.prisma.media.findFirst({
        where: {
          organizationId: media.organizationId,
          sourceUrl: updateMediaDto.sourceUrl,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException('This media URL already exists');
      }
    }

    return this.prisma.media.update({
      where: {
        id,
      },
      data: updateMediaDto,
    });
  }

  async remove(organization: Organization, id: string) {
    await this.findOne(organization, id);

    return this.prisma.media.delete({
      where: {
        id,
      },
    });
  }
}
