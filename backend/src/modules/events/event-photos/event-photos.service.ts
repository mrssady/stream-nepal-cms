import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../../prisma/prisma.service";

import { CreateEventPhotoDto } from "./create-event-photo.dto";
import { UpdateEventPhotoDto } from "./dto/update-event-photo.dto";

@Injectable()
export class EventPhotosService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async getOrganization() {
    const organization =
      await this.prisma.organization.findFirst({
        orderBy: {
          createdAt: "asc",
        },
      });

    if (!organization) {
      throw new NotFoundException(
        "Organization not found",
      );
    }

    return organization;
  }

  private async getEvent(
    eventId: string,
  ) {
    const organization =
      await this.getOrganization();

    const event =
      await this.prisma.event.findFirst({
        where: {
          id: eventId,
          organizationId:
            organization.id,
        },
      });

    if (!event) {
      throw new NotFoundException(
        "Event not found",
      );
    }

    return event;
  }

  async create(
    eventId: string,
    dto: CreateEventPhotoDto,
  ) {
    await this.getEvent(eventId);

    return this.prisma.eventPhoto.create({
      data: {
        eventId,

        title: dto.title,
        description: dto.description,

        imageUrl: dto.imageUrl,
        thumbnailUrl:
          dto.thumbnailUrl,

        featured:
          dto.featured ?? false,
        isActive:
          dto.isActive ?? true,
        displayOrder:
          dto.displayOrder ?? 0,
      },
    });
  }

  async findAll(eventId: string) {
    await this.getEvent(eventId);

    return this.prisma.eventPhoto.findMany({
      where: {
        eventId,
      },
      orderBy: [
        {
          displayOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }

  async findOne(
    eventId: string,
    id: string,
  ) {
    await this.getEvent(eventId);

    const photo =
      await this.prisma.eventPhoto.findFirst({
        where: {
          id,
          eventId,
        },
      });

    if (!photo) {
      throw new NotFoundException(
        "Event photo not found",
      );
    }

    return photo;
  }

  async update(
    eventId: string,
    id: string,
    dto: UpdateEventPhotoDto,
  ) {
    await this.findOne(
      eventId,
      id,
    );

    return this.prisma.eventPhoto.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(
    eventId: string,
    id: string,
  ) {
    await this.findOne(
      eventId,
      id,
    );

    return this.prisma.eventPhoto.delete({
      where: {
        id,
      },
    });
  }
}