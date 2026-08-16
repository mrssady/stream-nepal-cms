export enum Role {
  OWNER = 'OWNER',
  CO_OWNER = 'CO_OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

export const ROLE_LEVEL: Record<Role, number> = {
  STAFF: 1,
  MANAGER: 2,
  ADMIN: 3,
  CO_OWNER: 4,
  OWNER: 5,
};

export const ROLE_ORDER: Role[] = [
  Role.STAFF,
  Role.MANAGER,
  Role.ADMIN,
  Role.CO_OWNER,
  Role.OWNER,
];

export function roleLevel(role: Role | string): number {
  return ROLE_LEVEL[role as Role] ?? 0;
}

export function roleAtLeast(role: Role | string, minRole: Role): boolean {
  return roleLevel(role) >= roleLevel(minRole);
}

export function canManageRole(
  actorRole: Role | string,
  targetRole: Role | string,
): boolean {
  const ownerLevel = roleLevel(Role.OWNER);

  if (roleLevel(targetRole) === ownerLevel) {
    return roleLevel(actorRole) === ownerLevel;
  }

  return roleLevel(actorRole) > roleLevel(targetRole);
}
