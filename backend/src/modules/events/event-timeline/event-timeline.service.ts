import { Injectable, NotFoundException } from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { CreateEventTimelineDto } from './dto/create-event-timeline.dto';
import { UpdateEventTimelineDto } from './dto/update-event-timeline.dto';

@Injectable()
export class EventTimelineService {
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
    dto: CreateEventTimelineDto,
  ) {
    await this.getEvent(organization, eventId);

    return this.prisma.eventTimeline.create({
      data: {
        eventId,

        title: dto.title,
        description: dto.description,

        timelineDate: new Date(dto.timelineDate),

        imageUrl: dto.imageUrl,

        displayOrder: dto.displayOrder ?? 0,

        isActive: dto.isActive ?? true,

        featured: dto.featured ?? false,
      },
    });
  }

  async findAll(organization: Organization, eventId: string) {
    await this.getEvent(organization, eventId);

    return this.prisma.eventTimeline.findMany({
      where: {
        eventId,
      },
      orderBy: [
        {
          timelineDate: 'asc',
        },
        {
          displayOrder: 'asc',
        },
      ],
    });
  }

  async findOne(organization: Organization, eventId: string, id: string) {
    await this.getEvent(organization, eventId);

    const timeline = await this.prisma.eventTimeline.findFirst({
      where: {
        id,
        eventId,
      },
    });

    if (!timeline) {
      throw new NotFoundException('Timeline entry not found');
    }

    return timeline;
  }

  async update(
    organization: Organization,
    eventId: string,
    id: string,
    dto: UpdateEventTimelineDto,
  ) {
    await this.findOne(organization, eventId, id);

    const data: Record<string, unknown> = {
      ...dto,
    };

    if (dto.timelineDate) {
      data.timelineDate = new Date(dto.timelineDate);
    }

    return this.prisma.eventTimeline.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(organization: Organization, eventId: string, id: string) {
    await this.findOne(organization, eventId, id);

    return this.prisma.eventTimeline.delete({
      where: {
        id,
      },
    });
  }
}
