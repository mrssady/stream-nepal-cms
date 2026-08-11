import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async getOrganization() {
    const organization =
      await this.prisma.organization.findUnique({
        where: {
          slug: "stream-nepal",
        },
      });

    if (!organization) {
      throw new NotFoundException(
        "Stream Nepal organization not found",
      );
    }

    return organization;
  }

  async create(
    createEventDto: CreateEventDto,
  ) {
    const organization =
      await this.getOrganization();

    const existing =
      await this.prisma.event.findUnique({
        where: {
          organizationId_slug: {
            organizationId: organization.id,
            slug: createEventDto.slug,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        "An event with this slug already exists",
      );
    }

    const {
      eventDate,
      eventSeriesId,
      ...data
    } = createEventDto;

    if (eventSeriesId) {
      const series =
        await this.prisma.eventSeries.findFirst({
          where: {
            id: eventSeriesId,
            organizationId: organization.id,
          },
        });

      if (!series) {
        throw new NotFoundException(
          "Event series not found",
        );
      }
    }

    return this.prisma.event.create({
      data: {
        ...data,

        eventDate: new Date(eventDate),

        ...(eventSeriesId
          ? {
              eventSeries: {
                connect: {
                  id: eventSeriesId,
                },
              },
            }
          : {}),

        organization: {
          connect: {
            id: organization.id,
          },
        },
      },
    });
  }

  async findAll() {
    const organization =
      await this.getOrganization();

    return this.prisma.event.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        eventSeries: true,
      },
      orderBy: [
        {
          eventDate: "desc",
        },
        {
          displayOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }

  async findOne(id: string) {
    const organization =
      await this.getOrganization();

    const event =
      await this.prisma.event.findFirst({
        where: {
          id,
          organizationId: organization.id,
        },
        include: {
          eventSeries: true,
          photos: {
            where: {
              isActive: true,
            },
            orderBy: {
              displayOrder: "asc",
            },
          },
          videos: {
            where: {
              isActive: true,
            },
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
      });

    if (!event) {
      throw new NotFoundException(
        "Event not found",
      );
    }

    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
  ) {
    const event =
      await this.findOne(id);

    if (updateEventDto.slug) {
      const existing =
        await this.prisma.event.findFirst({
          where: {
            organizationId:
              event.organizationId,
            slug: updateEventDto.slug,
            NOT: {
              id,
            },
          },
        });

      if (existing) {
        throw new ConflictException(
          "An event with this slug already exists",
        );
      }
    }

    if (
      updateEventDto.eventSeriesId !==
      undefined
    ) {
      if (updateEventDto.eventSeriesId) {
        const series =
          await this.prisma.eventSeries.findFirst({
            where: {
              id:
                updateEventDto.eventSeriesId,
              organizationId:
                event.organizationId,
            },
          });

        if (!series) {
          throw new NotFoundException(
            "Event series not found",
          );
        }
      }
    }

    const {
      eventDate,
      eventSeriesId,
      ...data
    } = updateEventDto;

    return this.prisma.event.update({
      where: {
        id,
      },
      data: {
        ...data,

        ...(eventDate !== undefined
          ? {
              eventDate:
                new Date(eventDate),
            }
          : {}),

        ...(eventSeriesId !== undefined
          ? eventSeriesId
            ? {
                eventSeries: {
                  connect: {
                    id: eventSeriesId,
                  },
                },
              }
            : {
                eventSeries: {
                  disconnect: true,
                },
              }
          : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.event.delete({
      where: {
        id,
      },
    });
  }

  async findPublic() {
    const organization =
      await this.getOrganization();

    return this.prisma.event.findMany({
      where: {
        organizationId: organization.id,
        isActive: true,
      },
      include: {
        eventSeries: true,
        photos: {
          where: {
            isActive: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
        videos: {
          where: {
            isActive: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
      orderBy: [
        {
          eventDate: "desc",
        },
        {
          displayOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }
}