export type Department =
  | "MANAGEMENT"
  | "ESPORTS"
  | "BROADCAST"
  | "PRODUCTION"
  | "MEDIA"
  | "MARKETING";

export type TeamPosition =
  | "OWNER"
  | "CO_OWNER"
  | "MANAGER"
  | "OBSERVER"
  | "CASTER"
  | "HOST"
  | "CAMERA_OPERATOR"
  | "GRAPHICS_OPERATOR"
  | "VIDEO_EDITOR"
  | "SOCIAL_MEDIA_MANAGER"
  | "TOURNAMENT_ADMIN"
  | "REFEREE";

export interface TeamMember {
  id: string;
  fullName: string;
  nickname?: string | null;
  position: TeamPosition;
  department: Department;
  bio?: string | null;
  profileImage?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  discord?: string | null;
  phone?: string | null;
  email?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamMemberDto {
  fullName: string;
  nickname?: string;
  position: TeamPosition;
  department: Department;
  bio?: string;
  profileImage?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  discord?: string;
  phone?: string;
  email?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateTeamMemberDto {
  fullName?: string;
  nickname?: string;
  position?: TeamPosition;
  department?: Department;
  bio?: string;
  profileImage?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  discord?: string;
  phone?: string;
  email?: string;
  displayOrder?: number;
  isActive?: boolean;
}