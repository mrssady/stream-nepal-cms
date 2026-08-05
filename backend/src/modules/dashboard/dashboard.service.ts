import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      owners,
      coOwners,
      admins,
      managers,
      staff,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          role: Role.OWNER,
        },
      }),
      this.prisma.user.count({
        where: {
          role: Role.CO_OWNER,
        },
      }),
      this.prisma.user.count({
        where: {
          role: Role.ADMIN,
        },
      }),
      this.prisma.user.count({
        where: {
          role: Role.MANAGER,
        },
      }),
      this.prisma.user.count({
        where: {
          role: Role.STAFF,
        },
      }),
    ]);

    return {
      totalUsers,
      owners,
      coOwners,
      admins,
      managers,
      staff,
    };
  }
}