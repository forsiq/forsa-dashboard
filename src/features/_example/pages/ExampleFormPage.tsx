import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AmberButton } from '@core/components/AmberButton';
import { ExampleForm } from '../components/ExampleForm';

export const ExampleFormPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const isEdit = !!id;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/example">
          <AmberButton variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </AmberButton>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase">
            {isEdit ? 'Edit Item' : 'New Item'}
          </h1>
          <p className="text-sm text-zinc-muted mt-1">
            {isEdit ? 'Update the item details' : 'Create a new item'}
          </p>
        </div>
      </div>

      {/* Form */}
      <ExampleForm isEdit={isEdit} />
    </div>
  );
};
