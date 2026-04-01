import { useState, useCallback } from 'react';
import { ExampleItem, ExampleFormData } from '../types';
import * as api from '../api';

export const useExampleCRUD = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: ExampleFormData): Promise<ExampleItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.createExample(data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create item';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<ExampleFormData>): Promise<ExampleItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.updateExample(id, data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteExample(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOne = useCallback(async (id: string): Promise<ExampleItem> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.fetchExample(id);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch item';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    create,
    update,
    remove,
    getOne,
    isLoading,
    error
  };
};
