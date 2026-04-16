/**
 * User Management Types
 */

export interface User {
  id: number;
  userName: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  isTempPass: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCreateInput {
  userName: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user';
  password?: string;
  isActive?: boolean;
}

export interface UserUpdateInput extends Partial<UserCreateInput> {
  id: string | number;
  password?: string; // Optional for update
}


export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'manager' | 'user' | 'all';
  status?: 'active' | 'inactive' | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  managers: number;
  newThisMonth: number;
}

export interface UserFormData extends Omit<UserCreateInput, 'password'> {
  password?: string;
}
