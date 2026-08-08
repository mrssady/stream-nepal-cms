import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

@Injectable()
export class ServicesService {
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

  async create(createServiceDto: CreateServiceDto) {
    const organization =
      await this.getOrganization();

    const existing =
      await this.prisma.service.findUnique({
        where: {
          organizationId_slug: {
            organizationId: organization.id,
            slug: createServiceDto.slug,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        "A service with this slug already exists",
      );
    }

    return this.prisma.service.create({
      data: {
        ...createServiceDto,
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

    return this.prisma.service.findMany({
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

    const service =
      await this.prisma.service.findFirst({
        where: {
          id,
          organizationId: organization.id,
        },
      });

    if (!service) {
      throw new NotFoundException(
        "Service not found",
      );
    }

    return service;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ) {
    const service = await this.findOne(id);

    if (updateServiceDto.slug) {
      const existing =
        await this.prisma.service.findFirst({
          where: {
            organizationId:
              service.organizationId,
            slug: updateServiceDto.slug,
            NOT: {
              id,
            },
          },
        });

      if (existing) {
        throw new ConflictException(
          "A service with this slug already exists",
        );
      }
    }

    return this.prisma.service.update({
      where: {
        id,
      },
      data: updateServiceDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.service.delete({
      where: {
        id,
      },
    });
  }
}