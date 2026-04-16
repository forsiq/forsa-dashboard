import { ExampleItem, ExampleFormData, ExampleFilter, ExampleListResponse } from '../types';
import { useFeatureConfig } from '@features/_core/hooks/useFeatureConfig';

/**
 * Example API Service
 *
 * This demonstrates how to integrate with backend services.
 * All API calls use the configured base URL from zvs.config.json.
 */

const getBaseUrl = () => {
  // In a real app, you'd get this from the FeatureContext
  return 'http://localhost:3000';
};

/**
 * Fetch a list of items with optional filtering
 */
export const fetchExamples = async (filter: ExampleFilter = {}): Promise<ExampleListResponse> => {
  // TODO: Replace with actual API call
  // const params = new URLSearchParams(filter as any);
  // const response = await fetch(`${getBaseUrl()}/api/examples?${params}`);

  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            id: '1',
            title: 'Example Item 1',
            description: 'This is an example item',
            status: 'active',
            category: 'Category A',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Example Item 2',
            description: 'Another example item',
            status: 'pending',
            category: 'Category B',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        total: 2,
        page: filter.page || 1,
        limit: filter.limit || 10,
        totalPages: 1
      });
    }, 300);
  });
};

/**
 * Fetch a single item by ID
 */
export const fetchExample = async (id: string): Promise<ExampleItem> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`${getBaseUrl()}/api/examples/${id}`);
  // if (!response.ok) throw new Error('Failed to fetch item');
  // return response.json();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        title: `Example Item ${id}`,
        description: 'This is an example item',
        status: 'active',
        category: 'Category A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }, 200);
  });
};

/**
 * Create a new item
 */
export const createExample = async (data: ExampleFormData): Promise<ExampleItem> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`${getBaseUrl()}/api/examples`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data)
  // });
  // if (!response.ok) throw new Error('Failed to create item');
  // return response.json();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }, 300);
  });
};

/**
 * Update an existing item
 */
export const updateExample = async (id: string, data: Partial<ExampleFormData>): Promise<ExampleItem> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`${getBaseUrl()}/api/examples/${id}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data)
  // });
  // if (!response.ok) throw new Error('Failed to update item');
  // return response.json();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        title: data.title || 'Updated Title',
        description: data.description || 'Updated Description',
        status: data.status || 'active',
        category: data.category || 'Category A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }, 300);
  });
};

/**
 * Delete an item
 */
export const deleteExample = async (id: string): Promise<void> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`${getBaseUrl()}/api/examples/${id}`, {
  //   method: 'DELETE'
  // });
  // if (!response.ok) throw new Error('Failed to delete item');

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 200);
  });
};
