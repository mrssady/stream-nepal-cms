import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Organization } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organization: Organization, createProjectDto: CreateProjectDto) {
    const existing = await this.prisma.project.findUnique({
      where: {
        organizationId_slug: {
          organizationId: organization.id,
          slug: createProjectDto.slug,
        },
      },
    });

    if (existing) {
      throw new ConflictException('A project with this slug already exists');
    }

    const { projectDate, ...data } = createProjectDto;

    return this.prisma.project.create({
      data: {
        ...data,

        ...(projectDate
          ? {
              projectDate: new Date(projectDate),
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

  async findAll(organization: Organization) {
    return this.prisma.project.findMany({
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
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(
    organization: Organization,
    id: string,
    updateProjectDto: UpdateProjectDto,
  ) {
    const project = await this.findOne(organization, id);

    if (updateProjectDto.slug) {
      const existing = await this.prisma.project.findFirst({
        where: {
          organizationId: project.organizationId,
          slug: updateProjectDto.slug,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException('A project with this slug already exists');
      }
    }

    const { projectDate, ...data } = updateProjectDto;

    return this.prisma.project.update({
      where: {
        id,
      },
      data: {
        ...data,

        ...(projectDate !== undefined
          ? {
              projectDate: projectDate ? new Date(projectDate) : null,
            }
          : {}),
      },
    });
  }

  async remove(organization: Organization, id: string) {
    await this.findOne(organization, id);

    return this.prisma.project.delete({
      where: {
        id,
      },
    });
  }

  async findPublic(organization: Organization) {
    return this.prisma.project.findMany({
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
    const project = await this.prisma.project.findFirst({
      where: {
        organizationId: organization.id,
        slug,
        isActive: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
