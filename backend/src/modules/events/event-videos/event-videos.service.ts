import { Injectable, NotFoundException } from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { CreateEventVideoDto } from './dto/create-event-video.dto';
import { UpdateEventVideoDto } from './dto/update-event-video.dto';

@Injectable()
export class EventVideosService {
  constructor(private readonly prisma: PrismaService) {}

  private async getEvent(organization: Organization, eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId: organization.id,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async create(
    organization: Organization,
    eventId: string,
    dto: CreateEventVideoDto,
  ) {
    await this.getEvent(organization, eventId);

    return this.prisma.eventVideo.create({
      data: {
        eventId,

        title: dto.title,
        description: dto.description,

        platform: dto.platform,

        videoUrl: dto.videoUrl,
        thumbnailUrl: dto.thumbnailUrl,

        featured: dto.featured ?? false,
        isActive: dto.isActive ?? true,
        displayOrder: dto.displayOrder ?? 0,
      },
    });
  }

  async findAll(organization: Organization, eventId: string) {
    await this.getEvent(organization, eventId);

    return this.prisma.eventVideo.findMany({
      where: {
        eventId,
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

  async findOne(organization: Organization, eventId: string, id: string) {
    await this.getEvent(organization, eventId);

    const video = await this.prisma.eventVideo.findFirst({
      where: {
        id,
        eventId,
      },
    });

    if (!video) {
      throw new NotFoundException('Event video not found');
    }

    return video;
  }

  async update(
    organization: Organization,
    eventId: string,
    id: string,
    dto: UpdateEventVideoDto,
  ) {
    await this.findOne(organization, eventId, id);

    return this.prisma.eventVideo.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(organization: Organization, eventId: string, id: string) {
    await this.findOne(organization, eventId, id);

    return this.prisma.eventVideo.delete({
      where: {
        id,
      },
    });
  }
}
