// --- Customer Types ---

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  type: 'individual' | 'business';
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked';
  type?: 'individual' | 'business';
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  id: string;
}

export interface CustomerFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'blocked' | 'all';
  type?: 'individual' | 'business' | 'all';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  newThisMonth: number;
  topSpenders: Customer[];
}
