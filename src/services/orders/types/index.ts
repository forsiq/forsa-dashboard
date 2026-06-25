// Order types
/** Matches auction-service order.entity OrderStatus + legacy UI aliases. */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
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
  trackingNumber?: string;
  deliveryProvider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

export interface Address {
  fullName: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  postalCode?: string;
}

export interface CreateOrderInput {
  customerId: string;
  items: Omit<OrderItem, 'id' | 'totalPrice'>[];
  shippingAddress: Omit<Address, 'floor' | 'apartment' | 'postalCode'> & { floor?: string; apartment?: string; postalCode?: string };
  billingAddress?: Omit<Address, 'floor' | 'apartment' | 'postalCode'> & { floor?: string; apartment?: string; postalCode?: string };
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
  shippingAddress?: Address;
  billingAddress?: Address;
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
  sortBy?: 'createdAt' | 'finalPrice' | 'status' | 'paidAt' | 'total' | 'orderNumber' | 'date';
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
