import type { BaseEntity } from '../types/common';

export type Role = "administrator" | "anfitrion" | "guest";

export interface IUser extends BaseEntity {
  email: string;
  password?: string;
  confirmPassword?: string;
  name: string;
  // cc: string;
  lastName: string;
  phone: string;
  role: Role;
  avatar?: string;
  photoURL?: string;
  // address: string;
  birthDate?: number;
  city: string;
  country: string;
  lastLogin?: number;
}

// Utility types for user operations
export type CreateUserData = Omit<IUser, 'id' | 'createdAt' | 'lastLogin' | 'updatedAt'>;
export type UpdateUserData = Partial<Omit<IUser, 'id' | 'createdAt'>>;
export type LoginCredentials = Pick<IUser, 'email'> & { password: string };

// Auth-specific types
export interface AuthResponse {
  isAuthenticated: boolean;
  user?: IUser;
  message?: string;
  token?: string;
}

export interface RegisterResponse {
  isAuthenticated: boolean;
  message: string;
  user?: IUser;
}