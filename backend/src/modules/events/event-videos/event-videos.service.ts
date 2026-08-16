import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

import { CreateEventVideoDto } from './dto/create-event-video.dto';
import { UpdateEventVideoDto } from './dto/update-event-video.dto';

@Injectable()
export class EventVideosService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrganization() {
    const organization = await this.prisma.organization.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  private async getEvent(eventId: string) {
    const organization = await this.getOrganization();

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

  async create(eventId: string, dto: CreateEventVideoDto) {
    await this.getEvent(eventId);

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

  async findAll(eventId: string) {
    await this.getEvent(eventId);

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

  async findOne(eventId: string, id: string) {
    await this.getEvent(eventId);

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

  async update(eventId: string, id: string, dto: UpdateEventVideoDto) {
    await this.findOne(eventId, id);

    return this.prisma.eventVideo.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(eventId: string, id: string) {
    await this.findOne(eventId, id);

    return this.prisma.eventVideo.delete({
      where: {
        id,
      },
    });
  }
}
