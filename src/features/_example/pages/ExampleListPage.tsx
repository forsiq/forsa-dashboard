import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AmberButton } from '@core/components/AmberButton';
import { ExampleTable } from '../components/ExampleTable';
import { ExampleFilter } from '../components/ExampleFilter';
import { ExampleItem, ExampleFilter as FilterType } from '../types';
import { useExampleData } from '../hooks/useExampleData';
import { useExampleCRUD } from '../hooks/useExampleCRUD';

export const ExampleListPage = () => {
  const [filter, setFilter] = useState<FilterType>({});
  const { data, isLoading, refetch } = useExampleData(filter);
  const { remove } = useExampleCRUD();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = async (item: ExampleItem) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      await remove(item.id);
      refetch();
    }
  };

  if (!isClient) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">
            Example Items
          </h1>
          <p className="text-sm text-zinc-muted mt-1">
            Manage your example items with full CRUD operations
          </p>
        </div>
        <Link href="/example/new">
          <AmberButton variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </AmberButton>
        </Link>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filter */}
        <div className="lg:col-span-1">
          <ExampleFilter filter={filter} onFilterChange={setFilter} />
        </div>

        {/* Table */}
        <div className="lg:col-span-3">
          <ExampleTable
            data={data}
            isLoading={isLoading}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};
