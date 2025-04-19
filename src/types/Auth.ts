import { UserRole } from "./User";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  description?: string;
  activityArea?: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface AuthError {
  message: string;
  status: number;
} 