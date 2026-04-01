import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AmberButton } from '@core/components/AmberButton';
import { ExampleForm } from '../components/ExampleForm';
import { ExampleFormData } from '../types';

export const ExampleFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/example">
          <AmberButton variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </AmberButton>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">
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
