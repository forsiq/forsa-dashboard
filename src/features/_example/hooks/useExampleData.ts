import { useState, useEffect, useCallback } from 'react';
import { ExampleItem, ExampleFilter, ExampleListResponse } from '../types';
import * as api from '../api';

export const useExampleData = (filter: ExampleFilter = {}) => {
  const [data, setData] = useState<ExampleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(filter.page || 1);
  const [limit, setLimit] = useState(filter.limit || 10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.fetchExamples({ ...filter, page, limit });
      setData(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [filter, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    total,
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
    refetch
  };
};
