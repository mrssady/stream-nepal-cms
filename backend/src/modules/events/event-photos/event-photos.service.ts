import { Injectable, NotFoundException } from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { CreateEventPhotoDto } from './create-event-photo.dto';
import { UpdateEventPhotoDto } from './dto/update-event-photo.dto';

@Injectable()
export class EventPhotosService {
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
    dto: CreateEventPhotoDto,
  ) {
    await this.getEvent(organization, eventId);

    return this.prisma.eventPhoto.create({
      data: {
        eventId,

        title: dto.title,
        description: dto.description,

        imageUrl: dto.imageUrl,
        thumbnailUrl: dto.thumbnailUrl,

        featured: dto.featured ?? false,
        isActive: dto.isActive ?? true,
        displayOrder: dto.displayOrder ?? 0,
      },
    });
  }

  async findAll(organization: Organization, eventId: string) {
    await this.getEvent(organization, eventId);

    return this.prisma.eventPhoto.findMany({
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

    const photo = await this.prisma.eventPhoto.findFirst({
      where: {
        id,
        eventId,
      },
    });

    if (!photo) {
      throw new NotFoundException('Event photo not found');
    }

    return photo;
  }

  async update(
    organization: Organization,
    eventId: string,
    id: string,
    dto: UpdateEventPhotoDto,
  ) {
    await this.findOne(organization, eventId, id);

    return this.prisma.eventPhoto.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(organization: Organization, eventId: string, id: string) {
    await this.findOne(organization, eventId, id);

    return this.prisma.eventPhoto.delete({
      where: {
        id,
      },
    });
  }
}
