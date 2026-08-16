import { Injectable } from '@nestjs/common';

import { ActivityAction } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    actor: AuthenticatedUser | undefined,
    action: ActivityAction,
    resource: string,
    resourceId: string | null,
    summary: string,
  ) {
    try {
      let actorName: string | null = null;

      if (actor?.id) {
        const user = await this.prisma.user.findUnique({
          where: { id: actor.id },
          select: { name: true },
        });

        actorName = user?.name ?? null;
      }

      await this.prisma.activityLog.create({
        data: {
          actorId: actor?.id ?? null,
          actorName,
          action,
          resource,
          resourceId,
          summary,
        },
      });
    } catch {
      // Activity logging must never break the primary request.
    }
  }

  async findRecent(limit = 10) {
    return this.prisma.activityLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}
