/**
 * Category Select Component
 *
 * Dropdown for selecting categories in group buying form
 */

import { useGetCategories } from '@services/categories/hooks';
import { AmberDropdown } from '@core/components/AmberDropdown';
import { useLanguage } from '@core/contexts/LanguageContext';
import type { CategoriesResponse } from '@services/categories/types';

interface CategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  disabled = false,
}: CategorySelectProps) {
  const { t } = useLanguage();

  // Fetch categories
  const { data: categoriesData, isLoading } = useGetCategories({
    isActive: true,
    limit: 100,
  });

  // Access categories from GraphQL response
  const categories = (categoriesData as CategoriesResponse)?.categories || [];

  // Map categories to dropdown options
  const options = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <AmberDropdown
      label={t('groupBuying.category')}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={isLoading ? t('common.loading') || 'Loading...' : t('groupBuying.select_category')}
      className={disabled ? 'opacity-50 pointer-events-none' : ''}
    />
  );
}

export default CategorySelect;
