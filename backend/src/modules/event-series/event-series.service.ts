import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateEventSeriesDto } from './dto/create-event-series.dto';
import { UpdateEventSeriesDto } from './dto/update-event-series.dto';

@Injectable()
export class EventSeriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organization: Organization,
    createEventSeriesDto: CreateEventSeriesDto,
  ) {
    const existingSeries = await this.prisma.eventSeries.findFirst({
      where: {
        organizationId: organization.id,
        slug: createEventSeriesDto.slug,
      },
    });

    if (existingSeries) {
      throw new ConflictException('Event series slug already exists');
    }

    return this.prisma.eventSeries.create({
      data: {
        organizationId: organization.id,
        title: createEventSeriesDto.title,
        slug: createEventSeriesDto.slug,
        description: createEventSeriesDto.description,
        coverImage: createEventSeriesDto.coverImage,
        isActive: createEventSeriesDto.isActive ?? true,
        featured: createEventSeriesDto.featured ?? false,
        displayOrder: createEventSeriesDto.displayOrder ?? 0,
      },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });
  }

  async findAll(organization: Organization) {
    return this.prisma.eventSeries.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
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
    const series = await this.prisma.eventSeries.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
      include: {
        events: {
          orderBy: [
            {
              eventDate: 'desc',
            },
            {
              displayOrder: 'asc',
            },
          ],
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!series) {
      throw new NotFoundException('Event series not found');
    }

    return series;
  }

  async update(
    organization: Organization,
    id: string,
    updateEventSeriesDto: UpdateEventSeriesDto,
  ) {
    const existing = await this.prisma.eventSeries.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Event series not found');
    }

    if (updateEventSeriesDto.slug) {
      const duplicate = await this.prisma.eventSeries.findFirst({
        where: {
          organizationId: organization.id,
          slug: updateEventSeriesDto.slug,
          NOT: {
            id,
          },
        },
      });

      if (duplicate) {
        throw new ConflictException('Event series slug already exists');
      }
    }

    return this.prisma.eventSeries.update({
      where: {
        id,
      },
      data: updateEventSeriesDto,
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });
  }

  async remove(organization: Organization, id: string) {
    const existing = await this.prisma.eventSeries.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Event series not found');
    }

    return this.prisma.eventSeries.delete({
      where: {
        id,
      },
    });
  }

  async findPublic(organization: Organization) {
    return this.prisma.eventSeries.findMany({
      where: {
        organizationId: organization.id,
        isActive: true,
      },
      include: {
        events: {
          where: {
            isActive: true,
          },
          orderBy: [
            {
              eventDate: 'desc',
            },
            {
              displayOrder: 'asc',
            },
          ],
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: [
        {
          featured: 'desc',
        },
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
