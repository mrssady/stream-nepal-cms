import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
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
    createProjectDto: CreateProjectDto,
  ) {
    const organization =
      await this.getOrganization();

    const existing =
      await this.prisma.project.findUnique({
        where: {
          organizationId_slug: {
            organizationId: organization.id,
            slug: createProjectDto.slug,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        "A project with this slug already exists",
      );
    }

    const {
      projectDate,
      ...data
    } = createProjectDto;

    return this.prisma.project.create({
      data: {
        ...data,

        ...(projectDate
          ? {
              projectDate: new Date(
                projectDate,
              ),
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

    return this.prisma.project.findMany({
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

    const project =
      await this.prisma.project.findFirst({
        where: {
          id,
          organizationId: organization.id,
        },
      });

    if (!project) {
      throw new NotFoundException(
        "Project not found",
      );
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ) {
    const project =
      await this.findOne(id);

    if (updateProjectDto.slug) {
      const existing =
        await this.prisma.project.findFirst({
          where: {
            organizationId:
              project.organizationId,
            slug: updateProjectDto.slug,
            NOT: {
              id,
            },
          },
        });

      if (existing) {
        throw new ConflictException(
          "A project with this slug already exists",
        );
      }
    }

    const {
      projectDate,
      ...data
    } = updateProjectDto;

    return this.prisma.project.update({
      where: {
        id,
      },
      data: {
        ...data,

        ...(projectDate !== undefined
          ? {
              projectDate: projectDate
                ? new Date(projectDate)
                : null,
            }
          : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.project.delete({
      where: {
        id,
      },
    });
  }
}