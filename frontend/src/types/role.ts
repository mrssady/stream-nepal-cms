import type { UserRole } from "@/types/user";

export interface RoleInfo {
  role: UserRole;
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
  roles: UserRole[];
  grants: Record<UserRole, boolean>;
}

export interface MatrixGroup {
  id: string;
  label: string;
  rows: MatrixRow[];
}

export interface RolesOverview {
  roles: RoleInfo[];
  matrix: MatrixGroup[];
}