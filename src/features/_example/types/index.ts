export interface ExampleItem {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExampleFormData {
  title: string;
  description: string;
  status: ExampleItem['status'];
  category: string;
}

export interface ExampleFilter {
  search?: string;
  status?: ExampleItem['status'];
  category?: string;
  page?: number;
  limit?: number;
}

export interface ExampleListResponse {
  data: ExampleItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExampleApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
