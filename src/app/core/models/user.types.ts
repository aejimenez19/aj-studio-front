export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  roles: Role[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
}
