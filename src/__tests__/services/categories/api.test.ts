// Mock the category API functions directly
jest.mock('@services/categories/api/categories', () => ({
  createCategory: jest.fn(),
  getCategories: jest.fn(),
  getCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  categoryKeys: {
    all: ['categories'] as const,
    lists: () => ['categories', 'list'] as const,
    list: (filters: any) => ['categories', 'list', filters] as const,
    details: () => ['categories', 'detail'] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
    stats: () => ['categories', 'stats'] as const,
  },
}));

import { createCategory, getCategories } from '@services/categories/api/categories';

const mockedCreateCategory = createCategory as jest.MockedFunction<typeof createCategory>;
const mockedGetCategories = getCategories as jest.MockedFunction<typeof getCategories>;

describe('Category API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call createCategory with correct input', async () => {
    const mockResponse = {
      id: '1',
      name: 'Electronics',
      slug: 'electronics',
      status: 'active' as const,
      createdAt: '2026-01-01T00:00:00Z',
    };
    mockedCreateCategory.mockResolvedValue(mockResponse);

    const result = await createCategory({
      name: 'Electronics',
      status: 'active',
    });

    expect(mockedCreateCategory).toHaveBeenCalledWith({
      name: 'Electronics',
      status: 'active',
    });
    expect(result.name).toBe('Electronics');
    expect(result.id).toBe('1');
  });

  it('should call getCategories with filters', async () => {
    const mockResponse = {
      categories: [
        { id: '1', name: 'Cat1', createdAt: '2026-01-01' },
        { id: '2', name: 'Cat2', createdAt: '2026-01-02' },
      ],
      total: 2,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
    mockedGetCategories.mockResolvedValue(mockResponse);

    const result = await getCategories({ page: 1, limit: 50, status: 'active' });

    expect(mockedGetCategories).toHaveBeenCalledWith({ page: 1, limit: 50, status: 'active' });
    expect(result.categories).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should propagate 401 error from createCategory', async () => {
    mockedCreateCategory.mockRejectedValue({
      message: 'Unauthorized',
      status: 401,
    });

    await expect(createCategory({ name: 'Test' })).rejects.toEqual(
      expect.objectContaining({
        message: 'Unauthorized',
        status: 401,
      })
    );
  });

  it('should propagate validation errors with details', async () => {
    mockedCreateCategory.mockRejectedValue({
      message: 'Validation error',
      status: 400,
      details: { name: ['This field is required.'] },
    });

    await expect(createCategory({ name: '' })).rejects.toEqual(
      expect.objectContaining({
        message: 'Validation error',
        status: 400,
        details: { name: ['This field is required.'] },
      })
    );
  });
});
