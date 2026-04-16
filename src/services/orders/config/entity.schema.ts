/** Order Entity Schema */
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  priority: OrderPriority;
  notes?: string;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  fullName: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  street: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CreateOrderInput {
  customerId: string;
  items: Omit<OrderItem, 'id' | 'totalPrice'>[];
  shippingAddress: Omit<Address, never>;
  billingAddress?: Omit<Address, never>;
  notes?: string;
  currency?: string;
  priority?: OrderPriority;
}

export interface UpdateOrderInput {
  id: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  priority?: OrderPriority;
  notes?: string;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  priority?: OrderPriority | 'all';
  customerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  averageOrderValue: number;
}

export const orderEntityMeta = {
  name: 'orders',
  singular: 'order',
  plural: 'orders',
  endpoint: '/api/v1/orders',
  basePath: '/orders',
  i18nPrefix: 'orders',
  defaults: { status: 'pending' as const, priority: 'medium' as const },
  sortableFields: ['orderNumber', 'createdAt', 'total', 'customerName'] as const,
  filterableFields: ['search', 'status', 'paymentStatus', 'priority'] as const,
  requiredFields: ['customerId', 'items'] as const,
  hiddenFields: ['items', 'shippingAddress', 'billingAddress', 'createdAt', 'updatedAt'] as const,
};
