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
    grid: { xs: 12 },
  },
  {
    name: 'nameAr',
    label: 'category.name_ar',
    type: 'text',
    placeholder: 'الاسم بالعربية',
    validation: {
      max: 100,
    },
    grid: { xs: 12 },
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
    name: 'parentId',
    label: 'category.parent',
    type: 'select',
    options: [], // Populated dynamically
    placeholder: 'category.select_parent',
    grid: { xs: 12 },
  },
  {
    name: 'icon',
    label: 'category.icon',
    type: 'text',
    placeholder: 'category.icon_placeholder',
    grid: { xs: 12, md: 6 },
  },
  {
    name: 'isActive',
    label: 'category.status',
    type: 'radio',
    options: [
      { label: 'category.active', value: 'active' },
      { label: 'category.inactive', value: 'inactive' },
    ],
    defaultValue: 'active',
    required: true,
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

  layout: 'vertical' as const,
  columns: 1,

  sections: [
    {
      id: 'content',
      title: 'category.section_content',
      fields: ['name', 'nameAr', 'description'],
    },
    {
      id: 'placement',
      title: 'category.section_placement',
      fields: ['parentId', 'icon'],
    },
    {
      id: 'visibility',
      title: 'category.section_visibility',
      fields: ['isActive'],
    },
    {
      id: 'media',
      title: 'category.details',
      fields: ['image'],
    },
  ],

  validation: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
  },

  submitOnEnter: false,
  resetAfterSubmit: false,
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
