import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { CreateEventSponsorDto } from './create-event-sponsor.dto';
import { UpdateEventSponsorDto } from './update-event-sponsor.dto';

@Injectable()
export class EventSponsorsService {
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

  private async validateSponsor(organization: Organization, sponsorId: string) {
    const sponsor = await this.prisma.sponsor.findFirst({
      where: {
        id: sponsorId,
        organizationId: organization.id,
      },
    });

    if (!sponsor) {
      throw new NotFoundException('Sponsor not found');
    }

    return sponsor;
  }

  async create(
    organization: Organization,
    eventId: string,
    dto: CreateEventSponsorDto,
  ) {
    await this.getEvent(organization, eventId);
    await this.validateSponsor(organization, dto.sponsorId);

    const existing = await this.prisma.eventSponsor.findFirst({
      where: {
        eventId,
        sponsorId: dto.sponsorId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'This sponsor is already linked to the event',
      );
    }

    return this.prisma.eventSponsor.create({
      data: {
        eventId,
        sponsorId: dto.sponsorId,
        tier: dto.tier ?? 'PARTNER',
        featured: dto.featured ?? false,
        displayOrder: dto.displayOrder ?? 0,
      },
      include: {
        sponsor: true,
      },
    });
  }

  async findAll(organization: Organization, eventId: string) {
    await this.getEvent(organization, eventId);

    return this.prisma.eventSponsor.findMany({
      where: {
        eventId,
      },
      include: {
        sponsor: true,
      },
      orderBy: [
        {
          featured: 'desc',
        },
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });
  }

  async findOne(organization: Organization, eventId: string, id: string) {
    await this.getEvent(organization, eventId);

    const link = await this.prisma.eventSponsor.findFirst({
      where: {
        id,
        eventId,
      },
      include: {
        sponsor: true,
      },
    });

    if (!link) {
      throw new NotFoundException('Event sponsor not found');
    }

    return link;
  }

  async update(
    organization: Organization,
    eventId: string,
    id: string,
    dto: UpdateEventSponsorDto,
  ) {
    const link = await this.findOne(organization, eventId, id);

    if (dto.sponsorId && dto.sponsorId !== link.sponsorId) {
      await this.validateSponsor(organization, dto.sponsorId);

      const existing = await this.prisma.eventSponsor.findFirst({
        where: {
          eventId,
          sponsorId: dto.sponsorId,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          'This sponsor is already linked to the event',
        );
      }
    }

    return this.prisma.eventSponsor.update({
      where: {
        id,
      },
      data: dto,
      include: {
        sponsor: true,
      },
    });
  }

  async remove(organization: Organization, eventId: string, id: string) {
    await this.findOne(organization, eventId, id);

    return this.prisma.eventSponsor.delete({
      where: {
        id,
      },
    });
  }
}
