import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

import { CreateEventSponsorDto } from './create-event-sponsor.dto';
import { UpdateEventSponsorDto } from './update-event-sponsor.dto';

@Injectable()
export class EventSponsorsService {
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

  private async validateSponsor(sponsorId: string) {
    const organization = await this.getOrganization();

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

  async create(eventId: string, dto: CreateEventSponsorDto) {
    await this.getEvent(eventId);
    await this.validateSponsor(dto.sponsorId);

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

  async findAll(eventId: string) {
    await this.getEvent(eventId);

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

  async findOne(eventId: string, id: string) {
    await this.getEvent(eventId);

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

  async update(eventId: string, id: string, dto: UpdateEventSponsorDto) {
    const link = await this.findOne(eventId, id);

    if (dto.sponsorId && dto.sponsorId !== link.sponsorId) {
      await this.validateSponsor(dto.sponsorId);

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

  async remove(eventId: string, id: string) {
    await this.findOne(eventId, id);

    return this.prisma.eventSponsor.delete({
      where: {
        id,
      },
    });
  }
}
