import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CustomerFilters, CustomerStats, Customer } from '../types';
import { customerKeys } from '../api/customers';

// Mock data generators
const generateMockCustomers = (filters: CustomerFilters = {}): { customers: Customer[]; total: number } => {
  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      type: 'business',
      status: 'active',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      totalOrders: 15,
      totalSpent: 5420,
      lastOrderDate: '2024-03-15',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      company: '',
      type: 'individual',
      status: 'active',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
      },
      totalOrders: 8,
      totalSpent: 2100,
      lastOrderDate: '2024-03-10',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-03-10T00:00:00Z',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+1234567892',
      company: 'Tech Solutions',
      type: 'business',
      status: 'active',
      address: {
        street: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
      },
      totalOrders: 22,
      totalSpent: 8950,
      lastOrderDate: '2024-03-20',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-03-20T00:00:00Z',
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      phone: '+1234567893',
      company: '',
      type: 'individual',
      status: 'inactive',
      address: {
        street: '321 Elm St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        country: 'USA',
      },
      totalOrders: 3,
      totalSpent: 450,
      lastOrderDate: '2024-02-15',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-15T00:00:00Z',
    },
    {
      id: '5',
      name: 'Charlie Wilson',
      email: 'charlie@example.com',
      phone: '+1234567894',
      company: 'Global Trade',
      type: 'business',
      status: 'active',
      address: {
        street: '654 Maple Dr',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        country: 'USA',
      },
      totalOrders: 31,
      totalSpent: 12400,
      lastOrderDate: '2024-03-25',
      createdAt: '2024-02-10T00:00:00Z',
      updatedAt: '2024-03-25T00:00:00Z',
    },
  ];

  let filtered = [...mockCustomers];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.company?.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(c => c.status === filters.status);
  }

  // Apply type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(c => c.type === filters.type);
  }

  return {
    customers: filtered,
    total: filtered.length,
  };
};

const generateMockCustomer = (id: string): Customer => {
  const allCustomers = generateMockCustomers().customers;
  return allCustomers.find(c => c.id === id) || allCustomers[0];
};

const generateMockCustomerStats = (): any => ({
  total: 5,
  active: 4,
  inactive: 1,
  blocked: 0,
  newThisMonth: 2,
  topSpenders: generateMockCustomers().customers.slice(0, 3),
});

// --- Queries ---

export function useGetCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => generateMockCustomers(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetCustomer(id: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => generateMockCustomer(id),
    enabled: enabled && !!id,
  });
}

export function useGetCustomerStats() {
  return useQuery({
    queryKey: customerKeys.stats(),
    queryFn: generateMockCustomerStats,
    staleTime: 2 * 60 * 1000,
  });
}

// --- Mutations (Mock) ---

export function useCreateCustomerMutation(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: any) => {
      // Mock success
      return Promise.resolve({ id: 'new-' + Date.now(), ...input });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export function useUpdateCustomerMutation(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: any) => {
      // Mock success
      return Promise.resolve(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.details() });
      options?.onSuccess?.(undefined);
    },
    onError: options?.onError,
  });
}

export function useDeleteCustomerMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      // Mock success
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
