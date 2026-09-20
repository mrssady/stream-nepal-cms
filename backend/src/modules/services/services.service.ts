import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organization: Organization, createServiceDto: CreateServiceDto) {
    const existing = await this.prisma.service.findUnique({
      where: {
        organizationId_slug: {
          organizationId: organization.id,
          slug: createServiceDto.slug,
        },
      },
    });

    if (existing) {
      throw new ConflictException('A service with this slug already exists');
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

  async findAll(organization: Organization) {
    return this.prisma.service.findMany({
      where: {
        organizationId: organization.id,
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

  async findOne(organization: Organization, id: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(
    organization: Organization,
    id: string,
    updateServiceDto: UpdateServiceDto,
  ) {
    const service = await this.findOne(organization, id);

    if (updateServiceDto.slug) {
      const existing = await this.prisma.service.findFirst({
        where: {
          organizationId: service.organizationId,
          slug: updateServiceDto.slug,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException('A service with this slug already exists');
      }
    }

    return this.prisma.service.update({
      where: {
        id,
      },
      data: updateServiceDto,
    });
  }

  async remove(organization: Organization, id: string) {
    await this.findOne(organization, id);

    return this.prisma.service.delete({
      where: {
        id,
      },
    });
  }

  async findPublic(organization: Organization) {
    return this.prisma.service.findMany({
      where: {
        organizationId: organization.id,
        isActive: true,
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

  async findPublicOne(organization: Organization, slug: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        organizationId: organization.id,
        slug,
        isActive: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }
}
