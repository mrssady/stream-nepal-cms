import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

export const DEFAULT_ORGANIZATION_SLUG = 'stream-nepal';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveDefault() {
    const organization = await this.prisma.organization.findUnique({
      where: {
        slug: DEFAULT_ORGANIZATION_SLUG,
      },
    });

    if (!organization) {
      throw new NotFoundException(
        `Default organization "${DEFAULT_ORGANIZATION_SLUG}" not found`,
      );
    }

    return organization;
  }

  async resolveRequest(request: Request) {
    const headerId =
      'x-organization-id' in request.headers
        ? String(request.headers['x-organization-id'])
        : '';

    if (!headerId) {
      return this.resolveDefault();
    }

    return this.resolveById(headerId);
  }

  async resolveById(id: string) {
    if (!id) {
      throw new BadRequestException('Organization id is required');
    }

    const organization = await this.prisma.organization.findUnique({
      where: {
        id,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async create(createOrganizationDto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({
      where: {
        slug: createOrganizationDto.slug,
      },
    });

    if (existing) {
      throw new ConflictException(
        'An organization with this slug already exists',
      );
    }

    return this.prisma.organization.create({
      data: createOrganizationDto,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    await this.findOne(id);

    if (updateOrganizationDto.slug) {
      const existing = await this.prisma.organization.findFirst({
        where: {
          slug: updateOrganizationDto.slug,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          'An organization with this slug already exists',
        );
      }
    }

    return this.prisma.organization.update({
      where: {
        id,
      },
      data: updateOrganizationDto,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const organization = await this.findOne(id);

    if (organization.slug === DEFAULT_ORGANIZATION_SLUG) {
      throw new BadRequestException(
        'The default organization cannot be deleted',
      );
    }

    const members = await this.prisma.user.count({
      where: {
        organizationId: id,
      },
    });

    if (members > 0) {
      throw new BadRequestException(
        'Organization still has users assigned and cannot be deleted',
      );
    }

    return this.prisma.organization.delete({
      where: {
        id,
      },
    });
  }
}
