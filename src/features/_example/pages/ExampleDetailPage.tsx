import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { ExampleItem } from '../types';
import { useExampleCRUD } from '../hooks/useExampleCRUD';

const statusConfig = {
  active: { label: 'Active', color: 'text-success bg-success/10 border-success/20' },
  inactive: { label: 'Inactive', color: 'text-zinc-muted bg-white/5 border-white/10' },
  pending: { label: 'Pending', color: 'text-warning bg-warning/10 border-warning/20' }
};

export const ExampleDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getOne, remove, isLoading } = useExampleCRUD();
  const [item, setItem] = useState<ExampleItem | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (id && isClient) {
      getOne(id as string)
        .then(setItem)
        .catch(() => router.push('/example'));
    }
  }, [id, getOne, router, isClient]);

  const handleDelete = async () => {
    if (id && item && confirm(`Are you sure you want to delete "${item.title}"?`)) {
      await remove(id as string);
      router.push('/example');
    }
  };

  if (!isClient) return null;

  if (isLoading || !item) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-muted">Loading...</div>
      </div>
    );
  }

  const status = statusConfig[item.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/example">
            <AmberButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </AmberButton>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">
              {item.title}
            </h1>
            <p className="text-sm text-zinc-muted mt-1">
              Created on {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/example/${item.id}/edit`}>
            <AmberButton variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </AmberButton>
          </Link>
          <AmberButton variant="ghost" className="text-danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </AmberButton>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <AmberCard>
            <h2 className="text-sm font-black text-zinc-text uppercase tracking-wider mb-4">
              Description
            </h2>
            <p className="text-sm text-zinc-secondary leading-relaxed">
              {item.description}
            </p>
          </AmberCard>

          <AmberCard>
            <h2 className="text-sm font-black text-zinc-text uppercase tracking-wider mb-4">
              Additional Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-wider">
                  Category
                </span>
                <span className="text-sm font-bold text-zinc-text">{item.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-wider">
                  Status
                </span>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border rounded ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-wider">
                  ID
                </span>
                <span className="text-sm font-mono text-zinc-muted">{item.id}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-wider">
                  Last Updated
                </span>
                <span className="text-sm text-zinc-text">
                  {new Date(item.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </AmberCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AmberCard>
            <h2 className="text-sm font-black text-zinc-text uppercase tracking-wider mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link href={`/example/${item.id}/edit`} className="block">
                <AmberButton variant="outline" size="sm" className="w-full">
                  Edit Item
                </AmberButton>
              </Link>
              <button onClick={handleDelete} className="w-full">
                <AmberButton variant="ghost" size="sm" className="w-full text-danger">
                  Delete Item
                </AmberButton>
              </button>
            </div>
          </AmberCard>
        </div>
      </div>
    </div>
  );
};
