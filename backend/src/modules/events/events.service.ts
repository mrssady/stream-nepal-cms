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

  private async validateEventSeries(
    eventSeriesId: string | null | undefined,
    organizationId: string,
  ) {
    if (!eventSeriesId) {
      return;
    }

    const series =
      await this.prisma.eventSeries.findFirst({
        where: {
          id: eventSeriesId,
          organizationId,
        },
      });

    if (!series) {
      throw new NotFoundException(
        "Event series not found",
      );
    }
  }

  async create(
    createEventDto: CreateEventDto,
  ) {
    const organization =
      await this.getOrganization();

    const existingEvent =
      await this.prisma.event.findFirst({
        where: {
          organizationId: organization.id,
          slug: createEventDto.slug,
        },
      });

    if (existingEvent) {
      throw new ConflictException(
        "Event slug already exists",
      );
    }

    await this.validateEventSeries(
      createEventDto.eventSeriesId,
      organization.id,
    );

    return this.prisma.event.create({
      data: {
        organizationId: organization.id,
        title: createEventDto.title,
        slug: createEventDto.slug,
        eventSeriesId:
          createEventDto.eventSeriesId,
        shortDescription:
          createEventDto.shortDescription,
        description:
          createEventDto.description,
        coverImage:
          createEventDto.coverImage,
        category:
          createEventDto.category,
        client:
          createEventDto.client,
        organizer:
          createEventDto.organizer,
        location:
          createEventDto.location,
        eventDate: new Date(
          createEventDto.eventDate,
        ),
        eventUrl:
          createEventDto.eventUrl,
        featured:
          createEventDto.featured ?? false,
        isActive:
          createEventDto.isActive ?? true,
        displayOrder:
          createEventDto.displayOrder ?? 0,
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

  timeline: {
    where: {
      isActive: true,
    },
    orderBy: {
      timelineDate: "asc",
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
        _count: {
          select: {
            photos: true,
            videos: true,
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
    const organization =
      await this.getOrganization();

    const existing =
      await this.prisma.event.findFirst({
        where: {
          id,
          organizationId: organization.id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        "Event not found",
      );
    }

    if (updateEventDto.slug) {
      const duplicate =
        await this.prisma.event.findFirst({
          where: {
            organizationId: organization.id,
            slug: updateEventDto.slug,
            NOT: {
              id,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          "Event slug already exists",
        );
      }
    }

    if (
      updateEventDto.eventSeriesId !==
      undefined
    ) {
      await this.validateEventSeries(
        updateEventDto.eventSeriesId,
        organization.id,
      );
    }

    const data: Record<string, unknown> = {
      ...updateEventDto,
    };

    if (updateEventDto.eventDate) {
      data.eventDate = new Date(
        updateEventDto.eventDate,
      );
    }

    if (
      updateEventDto.eventSeriesId === null
    ) {
      data.eventSeriesId = null;
    }

    return this.prisma.event.update({
      where: {
        id,
      },
      data,
      include: {
        eventSeries: true,
        photos: true,
        videos: true,
      },
    });
  }

  async remove(id: string) {
    const organization =
      await this.getOrganization();

    const existing =
      await this.prisma.event.findFirst({
        where: {
          id,
          organizationId: organization.id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        "Event not found",
      );
    }

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

      timeline: {
        where: {
          isActive: true,
        },
        orderBy: {
          timelineDate: "asc",
        },
      },
    },

    orderBy: [
      {
        featured: "desc",
      },
      {
        eventDate: "desc",
      },
      {
        displayOrder: "asc",
      },
    ],
  });
}
async findPublicBySlug(slug: string) {
  const organization =
    await this.getOrganization();

  const event =
    await this.prisma.event.findFirst({
      where: {
        organizationId: organization.id,
        slug,
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

        timeline: {
          where: {
            isActive: true,
          },
          orderBy: {
            timelineDate: "asc",
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
}