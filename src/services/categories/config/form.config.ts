/**
 * Category Form Configuration
 *
 * Defines how the category form is rendered.
 * Includes field definitions, validation, and form layout.
 */

import type { FormFieldConfig } from '@core/services/types';

// ============================================================================
// Form Fields Configuration
// ============================================================================

export const categoryFormFields: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'category.name',
    type: 'text',
    placeholder: 'Enter category name',
    required: true,
    validation: {
      min: 2,
      max: 100,
    },
    grid: { xs: 12, md: 6 },
  },
  {
    name: 'nameAr',
    label: 'category.name_ar',
    type: 'text',
    placeholder: 'الاسم بالعربية',
    validation: {
      max: 100,
    },
    grid: { xs: 12, md: 6 },
  },
  {
    name: 'slug',
    label: 'category.slug',
    type: 'text',
    placeholder: 'category-url-slug',
    validation: {
      pattern: '^[a-z0-9-]+$',
      custom: (value: unknown) => {
        const str = String(value);
        if (str && !/^[a-z0-9-]+$/.test(str)) {
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        }
        return undefined;
      },
    },
    grid: { xs: 12, md: 6 },
  },
  {
    name: 'status',
    label: 'category.status',
    type: 'select',
    options: [
      { label: 'category.active', value: 'active' },
      { label: 'category.inactive', value: 'inactive' },
    ],
    defaultValue: 'active',
    required: true,
    grid: { xs: 12, md: 6 },
  },
  {
    name: 'parentId',
    label: 'category.parent',
    type: 'select',
    options: [], // Will be populated dynamically
    placeholder: 'category.select_parent',
    grid: { xs: 12, md: 6 },
  },
  {
    name: 'order',
    label: 'category.order',
    type: 'number',
    placeholder: '0',
    defaultValue: 0,
    validation: {
      min: 0,
    },
    grid: { xs: 12, md: 6 },
  },
  {
    name: 'description',
    label: 'category.description',
    type: 'textarea',
    placeholder: 'category.description_placeholder',
    validation: {
      max: 500,
    },
    grid: { xs: 12 },
  },
  {
    name: 'image',
    label: 'category.image',
    type: 'image',
    grid: { xs: 12 },
  },
];

// ============================================================================
// Form Configuration
// ============================================================================

export const categoryFormConfig = {
  fields: categoryFormFields,

  // Form layout
  layout: 'vertical' as const,
  columns: 2, // 2 columns for most fields, full width for description

  // Form sections (for multi-step forms)
  sections: [
    {
      id: 'basic',
      title: 'category.basic_info',
      description: 'category.basic_info_desc',
      fields: ['name', 'nameAr', 'slug', 'status', 'parentId', 'order'],
    },
    {
      id: 'details',
      title: 'category.details',
      fields: ['description', 'image'],
    },
  ],

  // Validation schema (matches the fields above)
  validation: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    slug: {
      pattern: /^[a-z0-9-]+$/,
    },
  },

  // Submit behavior
  submitOnEnter: false,
  resetAfterSubmit: false,

  // Auto-generate slug from name
  autoSlug: {
    from: 'name',
    to: 'slug',
    lowercase: true,
    slugify: true,
  },
};

// ============================================================================
// Form Actions Configuration
// ============================================================================

export const categoryFormActions = {
  create: {
    primary: 'category.add',
    secondary: 'common.save_and_continue',
    tertiary: 'common.cancel',
  },
  edit: {
    primary: 'common.save',
    secondary: 'common.save_and_continue',
    tertiary: 'common.cancel',
  },
};
