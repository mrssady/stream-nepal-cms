import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import {
  Role,
  ROLE_LEVEL,
  ROLE_ORDER,
  roleLevel,
} from '../../common/enums/role.enum';

export interface RoleInfo {
  role: Role;
  label: string;
  level: number;
  description: string;
  exampleCapabilities: string[];
  memberCount: number;
}

export interface MatrixRow {
  id: string;
  resource: string;
  action: string;
  roles: Role[];
  grants: Record<Role, boolean>;
}

export interface MatrixGroup {
  id: string;
  label: string;
  rows: MatrixRow[];
}

const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Owner',
  CO_OWNER: 'Co-Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  STAFF: 'Staff',
};

const ROLE_DESCRIPTION: Record<Role, string> = {
  OWNER:
    'Full control of the CMS: users, website settings, content, tournaments and live broadcast, including all destructive actions.',
  CO_OWNER:
    'Owner-level access in daily operations. Cannot edit owner-only settings or remove / demote the last Owner.',
  ADMIN:
    'Manages users, content, tournaments, rosters and live matches. Cannot access owner-only settings or manage Owners.',
  MANAGER:
    'Creates and edits published content and drives in-match live broadcast events. Read and review access to OCR; no deletions.',
  STAFF:
    'Read-only access to published content inside the CMS (services, projects, events, event series, sponsors).',
};

const ROLE_CAPABILITIES: Record<Role, string[]> = {
  OWNER: [
    'Everything below plus owner-only website settings edits',
    'Create, promote, demote or delete users of any role (not the last Owner)',
  ],
  CO_OWNER: [
    'All Admin capabilities',
    'Manage Co-Owners, Admins, Managers and Staff; owner-only settings excluded',
  ],
  ADMIN: [
    'Full user management (except Owners)',
    'Create, edit and delete content, media and sponsors',
    'Manage tournaments, registrations, teams, players, matches and live matches',
  ],
  MANAGER: [
    'Create and edit content (services, projects, events, event series, sponsors)',
    'In-match control of live matches (events, zones, corrections)',
    'OCR analysis, monitor and review queue (approve/reject ZONE events)',
  ],
  STAFF: [
    'View published content in the CMS',
    'No create, edit or delete access',
  ],
};

const MATRIX_GROUPS: Array<{
  id: string;
  label: string;
  rows: Array<Omit<MatrixRow, 'grants'>>;
}> = [
  {
    id: 'system',
    label: 'System & Access',
    rows: [
      {
        id: 'dashboard-view',
        resource: 'Dashboard',
        action: 'View stats & activity',
        roles: [Role.OWNER, Role.ADMIN],
      },
      {
        id: 'users-manage',
        resource: 'Users',
        action: 'Full management (create, list, edit, delete)',
        roles: [Role.OWNER, Role.ADMIN],
      },
      {
        id: 'settings-view',
        resource: 'Website Settings',
        action: 'View',
        roles: [Role.OWNER, Role.ADMIN],
      },
      {
        id: 'settings-edit',
        resource: 'Website Settings',
        action: 'Edit',
        roles: [Role.OWNER],
      },
    ],
  },
  {
    id: 'content',
    label: 'Content & Portfolio',
    rows: [
      {
        id: 'content-write',
        resource: 'Services, Projects, Events, Event Series, Sponsors',
        action: 'Create & edit',
        roles: [Role.OWNER, Role.ADMIN, Role.MANAGER],
      },
      {
        id: 'content-view',
        resource: 'Services, Projects, Events, Event Series, Sponsors',
        action: 'View',
        roles: [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF],
      },
      {
        id: 'content-delete',
        resource: 'Services, Projects, Events, Event Series, Sponsors',
        action: 'Delete',
        roles: [Role.OWNER, Role.ADMIN],
      },
      {
        id: 'event-media-write',
        resource: 'Event photos, videos, timeline & sponsor links',
        action: 'Create & edit',
        roles: [Role.OWNER, Role.ADMIN, Role.MANAGER],
      },
      {
        id: 'event-media-view',
        resource: 'Event photos, videos, timeline & sponsor links',
        action: 'View',
        roles: [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.STAFF],
      },
      {
        id: 'event-media-delete',
        resource: 'Event photos, videos, timeline & sponsor links',
        action: 'Delete',
        roles: [Role.OWNER, Role.ADMIN],
      },
      {
        id: 'media-manage',
        resource: 'Gallery / Media library',
        action: 'Manage',
        roles: [Role.OWNER, Role.ADMIN],
      },
    ],
  },
  {
    id: 'tournaments',
    label: 'Tournaments & Roster',
    rows: [
      {
        id: 'tournaments-manage',
        resource:
          'Tournaments, Registrations, Tournament Teams, Matches, Players',
        action: 'Manage',
        roles: [Role.OWNER, Role.ADMIN],
      },
      {
        id: 'team-members-manage',
        resource: 'Team Members',
        action: 'Manage',
        roles: [Role.OWNER, Role.ADMIN],
      },
    ],
  },
  {
    id: 'live',
    label: 'Live Broadcast & OCR',
    rows: [
      {
        id: 'live-match-manage',
        resource: 'Live Matches',
        action: 'Create, configure & finish',
        roles: [Role.OWNER, Role.ADMIN],
      },
      {
        id: 'live-match-control',
        resource: 'Live Matches',
        action: 'In-match control (events, zone, undo)',
        roles: [Role.OWNER, Role.ADMIN, Role.MANAGER],
      },
      {
        id: 'ocr-profiles-manage',
        resource: 'OCR Profiles',
        action: 'Manage (create, edit, set default, delete)',
        roles: [Role.OWNER, Role.ADMIN],
      },
      {
        id: 'ocr-analysis',
        resource: 'OCR',
        action: 'Analyze, monitor & review',
        roles: [Role.OWNER, Role.ADMIN, Role.MANAGER],
      },
    ],
  },
];

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const grouped = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true,
      },
    });

    const countByRole = new Map<Role, number>(
      grouped.map((entry) => [entry.role as Role, entry._count._all]),
    );

    const roles: RoleInfo[] = ROLE_ORDER.map((role) => ({
      role,
      label: ROLE_LABEL[role],
      level: ROLE_LEVEL[role],
      description: ROLE_DESCRIPTION[role],
      exampleCapabilities: ROLE_CAPABILITIES[role],
      memberCount: countByRole.get(role) ?? 0,
    }));

    const matrix: MatrixGroup[] = MATRIX_GROUPS.map((group) => ({
      ...group,
      rows: group.rows.map((row) => ({
        ...row,
        grants: this.buildGrants(row.roles),
      })),
    }));

    return { roles, matrix };
  }

  private buildGrants(requiredRoles: Role[]): Record<Role, boolean> {
    const threshold = Math.min(...requiredRoles.map((role) => roleLevel(role)));

    const grants = {} as Record<Role, boolean>;

    for (const role of ROLE_ORDER) {
      grants[role] = roleLevel(role) >= threshold;
    }

    return grants;
  }
}
