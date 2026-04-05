/**
 * User Form Configuration
 */

// Local type definition - FieldConfig not exported from @core/services/types
type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'datetime' | 'switch' | 'email' | 'tel' | 'password';
  required?: boolean | string;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  options?: Array<{ label: string; value: string | number }>;
  defaultValue?: any;
  relation?: string;
  condition?: (formData: any) => boolean;
};

export const userFormFields: FieldConfig[] = [
  {
    name: 'userName',
    label: 'user.username',
    type: 'text',
    required: true,
    placeholder: 'user.username_placeholder',
    validation: {
      minLength: 3,
      maxLength: 20,
      pattern: '^[a-zA-Z0-9_]+$',
    },
  },
  {
    name: 'fullName',
    label: 'user.full_name',
    type: 'text',
    required: true,
    placeholder: 'user.full_name_placeholder',
    validation: {
      minLength: 2,
      maxLength: 100,
    },
  },
  {
    name: 'email',
    label: 'user.email',
    type: 'email',
    required: false,
    placeholder: 'user.email_placeholder',
  },
  {
    name: 'phone',
    label: 'user.phone',
    type: 'tel',
    required: false,
    placeholder: 'user.phone_placeholder',
  },
  {
    name: 'role',
    label: 'user.role',
    type: 'select',
    required: true,
    options: [
      { label: 'user.role.admin', value: 'admin' },
      { label: 'user.role.manager', value: 'manager' },
      { label: 'user.role.user', value: 'user' },
    ],
  },
  {
    name: 'password',
    label: 'user.password',
    type: 'password',
    required: 'create', // Only required for create, not update
    placeholder: 'user.password_placeholder',
    validation: {
      minLength: 6,
    },
    condition: (formData) => !formData.id, // Only show for new users
  },
  {
    name: 'isActive',
    label: 'user.is_active',
    type: 'switch',
    defaultValue: true,
  },
];

// Form validation schema
export const userFormValidation = {
  userName: (value: string) => {
    if (!value || value.trim().length < 3) {
      return 'user.username_too_short';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'user.username_invalid';
    }
    return null;
  },
  fullName: (value: string) => {
    if (!value || value.trim().length < 2) {
      return 'user.full_name_required';
    }
    return null;
  },
  email: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'user.email_invalid';
    }
    return null;
  },
  role: (value: string) => {
    if (!value || !['admin', 'manager', 'user'].includes(value)) {
      return 'user.role_required';
    }
    return null;
  },
  password: (value: string, isNewUser: boolean) => {
    if (isNewUser && (!value || value.length < 6)) {
      return 'user.password_too_short';
    }
    return null;
  },
};
