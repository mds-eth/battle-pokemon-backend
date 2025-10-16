export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pokemon {
  id: number;
  name: string;
  type: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  user?: UserWithoutPassword;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  token: string;
  expiresIn: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
