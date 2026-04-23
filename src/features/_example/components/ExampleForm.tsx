import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Save, X } from 'lucide-react';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { ExampleFormData, ExampleItem } from '../types';
import { useExampleCRUD } from '../hooks/useExampleCRUD';

interface ExampleFormProps {
  initialData?: ExampleFormData;
  onSubmit?: (data: ExampleFormData) => Promise<void>;
  isEdit?: boolean;
}

const categories = ['Category A', 'Category B', 'Category C', 'Category D'];

export const ExampleForm: React.FC<ExampleFormProps> = ({
  initialData,
  onSubmit,
  isEdit = false
}) => {
  const router = useRouter();
  const { id } = router.query;
  const { getOne, create, update, isLoading } = useExampleCRUD();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [formData, setFormData] = React.useState<ExampleFormData>(
    initialData || {
      title: '',
      description: '',
      status: 'pending',
      category: 'Category A'
    }
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Load data for edit mode
  useEffect(() => {
    if (isEdit && id && !initialData && isClient) {
      getOne(id as string)
        .then((item) => {
          setFormData({
            title: item.title,
            description: item.description,
            status: item.status,
            category: item.category
          });
        })
        .catch(() => {
          router.push('/example');
        });
    }
  }, [isEdit, id, initialData, getOne, router, isClient]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else if (isEdit && id) {
        await update(id as string, formData);
      } else {
        await create(formData);
      }
      router.push('/example');
    } catch (err) {
      // Error handled by hook
    }
  };

  if (!isClient) return null;

  return (
    <AmberCard>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AmberInput
          label="Title"
          placeholder="Enter title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          required
        />

        <AmberInput
          label="Description"
          multiline
          rows={4}
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 text-zinc-muted">
              Category
            </label>
            <select
              className="w-full bg-obsidian-outer border rounded-sm text-sm font-bold text-zinc-text outline-none h-11 px-4 border-white/5 focus:border-brand/30"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest px-1 text-zinc-muted">
              Status
            </label>
            <select
              className="w-full bg-obsidian-outer border rounded-sm text-sm font-bold text-zinc-text outline-none h-11 px-4 border-white/5 focus:border-brand/30"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ExampleFormData['status'] })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <AmberButton
            type="button"
            variant="ghost"
            onClick={() => router.push('/example')}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </AmberButton>
          <AmberButton
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </AmberButton>
        </div>
      </form>
    </AmberCard>
  );
};
