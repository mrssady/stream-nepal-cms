export interface User {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "STAFF";
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: "OWNER" | "ADMIN" | "STAFF";
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: "OWNER" | "ADMIN" | "STAFF";
}