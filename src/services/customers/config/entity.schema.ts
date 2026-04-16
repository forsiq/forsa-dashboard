/** Customer Entity Schema */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  type: 'individual' | 'business';
  company?: string;
  address?: { street?: string; city?: string; state?: string; country?: string };
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
  address?: { street?: string; city?: string; state?: string; country?: string };
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

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  newThisMonth: number;
}

export const customerEntityMeta = {
  name: 'customers',
  singular: 'customer',
  plural: 'customers',
  endpoint: '/api/v1/customers',
  basePath: '/customers',
  i18nPrefix: 'customer',
  defaults: { status: 'active' as const, type: 'individual' as const },
  sortableFields: ['name', 'email', 'createdAt', 'totalSpent'] as const,
  filterableFields: ['search', 'status', 'type'] as const,
  requiredFields: ['name', 'email'] as const,
  hiddenFields: ['address', 'avatar', 'createdAt', 'updatedAt'] as const,
};
