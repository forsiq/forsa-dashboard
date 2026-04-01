import axios from 'axios';
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  ProductsResponse,
  InventoryStats,
  StockMovement,
  StockMovementFilters,
  StockMovementsResponse,
} from '../types';

// --- API Client Configuration ---

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_VERSION = 'v1';
const INVENTORY_ENDPOINT = `${API_BASE_URL}/api/${API_VERSION}/inventory`;

// Create axios instance for inventory
const inventoryClient = axios.create({
  baseURL: INVENTORY_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
inventoryClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
inventoryClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      message,
      code: error.response?.data?.code,
      status: error.response?.status,
      details: error.response?.data?.details,
    });
  }
);

// --- Products API ---

/**
 * Fetch products with optional filters
 */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.categoryId) params.append('category_id', filters.categoryId);
  if (filters.brandId) params.append('brand_id', filters.brandId);
  if (filters.stockStatus && filters.stockStatus !== 'all') params.append('stock_status', filters.stockStatus);
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.isActive !== undefined && filters.isActive !== 'all') {
    params.append('is_active', String(filters.isActive));
  }
  params.append('page', String(filters.page || 1));
  params.append('limit', String(filters.limit || 50));
  if (filters.sortBy) params.append('sort_by', filters.sortBy);
  if (filters.sortOrder) params.append('sort_order', filters.sortOrder);

  const response = await inventoryClient.get(`/products/?${params.toString()}`);
  return response.data;
}

/**
 * Fetch a single product by ID
 */
export async function getProduct(id: string): Promise<Product> {
  const response = await inventoryClient.get(`/products/${id}`);
  return response.data;
}

/**
 * Create a new product
 */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  const response = await inventoryClient.post('/products/', input);
  return response.data;
}

/**
 * Update an existing product
 */
export async function updateProduct(input: UpdateProductInput): Promise<Product> {
  const { id, ...data } = input;
  const response = await inventoryClient.patch(`/products/${id}`, data);
  return response.data;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  await inventoryClient.delete(`/products/${id}`);
}

/**
 * Update product stock
 */
export async function updateStock(productId: string, quantity: number, type: 'in' | 'out' | 'adjustment', notes?: string): Promise<Product> {
  const response = await inventoryClient.post(`/products/${productId}/stock`, {
    quantity,
    type,
    notes,
  });
  return response.data;
}

// --- Stock Movements API ---

/**
 * Fetch stock movements with optional filters
 */
export async function getStockMovements(
  filters: StockMovementFilters = {}
): Promise<StockMovementsResponse> {
  const params = new URLSearchParams();

  if (filters.productId) params.append('product_id', filters.productId);
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  params.append('page', String(filters.page || 1));
  params.append('limit', String(filters.limit || 50));

  const response = await inventoryClient.get(`/movements/?${params.toString()}`);
  return response.data;
}

// --- Statistics API ---

/**
 * Get inventory statistics
 */
export async function getInventoryStats(): Promise<InventoryStats> {
  const response = await inventoryClient.get('/stats/');
  return response.data;
}

// --- Query Keys ---

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  stats: () => [...productKeys.all, 'stats'] as const,
} as const;

export const stockMovementKeys = {
  all: ['stock_movements'] as const,
  lists: () => [...stockMovementKeys.all, 'list'] as const,
  list: (filters: StockMovementFilters) => [...stockMovementKeys.lists(), filters] as const,
} as const;
