import axios from 'axios';

const PROXY_BASE = '/api/amazon';

const api = axios.create({
  baseURL: PROXY_BASE,
});

export interface AmazonSearchResult {
  asin: string;
  title: string;
  image: string;
  images?: { link: string }[];
  price?: {
    value?: number;
    display?: string;
    currency?: string;
    was_price?: string;
    savings_percent?: number;
  };
  rating?: number;
  ratings_total?: number;
  is_prime?: boolean;
  link?: string;
  position?: number;
}

export interface AmazonProduct {
  asin: string;
  title?: string;
  image?: string;
  images?: { link: string }[];
  videos?: { url: string }[];
  price?: {
    value?: number;
    display?: string;
    currency?: string;
    was_price?: string;
    savings_percent?: number;
  };
  rating?: number;
  ratings_total?: number;
  is_prime?: boolean;
  description?: string;
  feature_bullets?: string[];
  specifications?: Record<string, any>;
  brand?: string;
  link?: string;
  buybox_winner?: {
    price?: {
      value?: number;
      display?: string;
    };
  };
}

export interface AmazonSearchResponse {
  search_results?: AmazonSearchResult[];
  search_information?: {
    total_results?: number;
    query_displayed?: string;
  };
}

export interface AmazonProductResponse {
  product?: AmazonProduct;
}

export interface AmazonBestSellersResponse {
  bestsellers?: AmazonSearchResult[];
}

export const amazonApi = {
  searchProducts: async (
    query: string,
    options?: { limit?: number; domain?: string }
  ): Promise<AmazonSearchResponse> => {
    const response = await api.get('/products/search', {
      params: {
        q: query,
        num: options?.limit || 20,
        amazon_domain: options?.domain || 'amazon.sa',
      },
    });
    return response.data;
  },

  getProductDetails: async (
    asin: string,
    options?: { domain?: string }
  ): Promise<AmazonProductResponse> => {
    const response = await api.get(`/products/${asin}`, {
      params: {
        amazon_domain: options?.domain || 'amazon.sa',
      },
    });
    return response.data;
  },

  getBestSellers: async (
    options?: { category?: string; limit?: number; domain?: string }
  ): Promise<AmazonBestSellersResponse> => {
    const response = await api.get('/products/bestsellers', {
      params: {
        category: options?.category || 'aps',
        num: options?.limit || 20,
        amazon_domain: options?.domain || 'amazon.sa',
      },
    });
    return response.data;
  },
};
