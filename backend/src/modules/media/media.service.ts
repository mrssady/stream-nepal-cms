import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

import { CreateMediaDto } from "./dto/create-media.dto";
import { UpdateMediaDto } from "./dto/update-media.dto";

@Injectable()
export class MediaService {
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

  async create(createMediaDto: CreateMediaDto) {
    const organization =
      await this.getOrganization();

    const existing =
      await this.prisma.media.findFirst({
        where: {
          organizationId: organization.id,
          sourceUrl: createMediaDto.sourceUrl,
        },
      });

    if (existing) {
      throw new ConflictException(
        "This media URL already exists",
      );
    }

    return this.prisma.media.create({
      data: {
        ...createMediaDto,
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

    return this.prisma.media.findMany({
      where: {
        organizationId: organization.id,
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

  async findOne(id: string) {
    const organization =
      await this.getOrganization();

    const media =
      await this.prisma.media.findFirst({
        where: {
          id,
          organizationId: organization.id,
        },
      });

    if (!media) {
      throw new NotFoundException(
        "Media not found",
      );
    }

    return media;
  }

  async update(
    id: string,
    updateMediaDto: UpdateMediaDto,
  ) {
    const media =
      await this.findOne(id);

    if (updateMediaDto.sourceUrl) {
      const existing =
        await this.prisma.media.findFirst({
          where: {
            organizationId:
              media.organizationId,
            sourceUrl:
              updateMediaDto.sourceUrl,
            NOT: {
              id,
            },
          },
        });

      if (existing) {
        throw new ConflictException(
          "This media URL already exists",
        );
      }
    }

    return this.prisma.media.update({
      where: {
        id,
      },
      data: updateMediaDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.media.delete({
      where: {
        id,
      },
    });
  }
}