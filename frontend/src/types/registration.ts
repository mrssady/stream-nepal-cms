import type { Tournament } from "./tournament";

export type RegistrationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "WAITLIST";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "REFUNDED";

export interface Registration {
  id: string;
  tournamentId: string;
  teamName: string;
  teamLogo?: string | null;
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  managerName?: string | null;
  managerPhone?: string | null;
  discordUsername?: string | null;
  gameUID: string;
  gameIGN: string;
  rosterSize: number;
  paymentStatus: PaymentStatus;
  registrationStatus: RegistrationStatus;
  remarks?: string | null;
  tournament?: Tournament | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegistrationDto {
  tournamentId: string;
  teamName: string;
  teamLogo?: string;
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  managerName?: string;
  managerPhone?: string;
  discordUsername?: string;
  gameUID: string;
  gameIGN: string;
  rosterSize: number;
  paymentStatus?: PaymentStatus;
  registrationStatus?: RegistrationStatus;
  remarks?: string;
}

export interface UpdateRegistrationDto {
  tournamentId?: string;
  teamName?: string;
  teamLogo?: string;
  captainName?: string;
  captainEmail?: string;
  captainPhone?: string;
  managerName?: string;
  managerPhone?: string;
  discordUsername?: string;
  gameUID?: string;
  gameIGN?: string;
  rosterSize?: number;
  paymentStatus?: PaymentStatus;
  registrationStatus?: RegistrationStatus;
  remarks?: string;
}