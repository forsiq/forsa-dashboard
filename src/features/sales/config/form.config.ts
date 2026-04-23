/**
 * Group Buying Form Configuration
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

export const groupBuyingFormFields: FieldConfig[] = [
  {
    name: 'title',
    label: 'groupBuying.title',
    type: 'text',
    required: true,
    placeholder: 'groupBuying.title_placeholder',
    validation: {
      minLength: 3,
      maxLength: 200,
    },
  },
  {
    name: 'description',
    label: 'groupBuying.description',
    type: 'textarea',
    required: false,
    placeholder: 'groupBuying.description_placeholder',
    validation: {
      maxLength: 1000,
    },
  },
  {
    name: 'categoryId',
    label: 'groupBuying.category',
    type: 'select',
    required: true,
    options: [], // Will be populated from categories service
    relation: 'categories',
  },
  {
    name: 'productId',
    label: 'groupBuying.item',
    type: 'select',
    required: true,
    options: [], // Will be populated from auctions service
    relation: 'auctions',
  },
  {
    name: 'originalPrice',
    label: 'groupBuying.original_price',
    type: 'number',
    required: true,
    placeholder: 'groupBuying.original_price_placeholder',
    validation: {
      min: 0,
    },
  },
  {
    name: 'dealPrice',
    label: 'groupBuying.deal_price',
    type: 'number',
    required: true,
    placeholder: 'groupBuying.deal_price_placeholder',
    validation: {
      min: 0,
    },
  },
  {
    name: 'minParticipants',
    label: 'groupBuying.min_participants',
    type: 'number',
    required: true,
    defaultValue: 2,
    placeholder: 'groupBuying.min_participants_placeholder',
    validation: {
      min: 1,
    },
  },
  {
    name: 'maxParticipants',
    label: 'groupBuying.max_participants',
    type: 'number',
    required: true,
    defaultValue: 100,
    placeholder: 'groupBuying.max_participants_placeholder',
    validation: {
      min: 1,
    },
  },
  {
    name: 'startTime',
    label: 'groupBuying.start_time',
    type: 'datetime',
    required: true,
  },
  {
    name: 'endTime',
    label: 'groupBuying.end_time',
    type: 'datetime',
    required: true,
  },
  {
    name: 'autoCreateOrder',
    label: 'groupBuying.auto_create_order',
    type: 'switch',
    defaultValue: true,
  },
];

// Form validation schema
export const groupBuyingFormValidation = {
  title: (value: string) => {
    if (!value || value.trim().length < 3) {
      return 'groupBuying.validation.title_too_short';
    }
    return null;
  },
  categoryId: (value: string) => {
    if (!value) {
      return 'groupBuying.validation.category_required';
    }
    return null;
  },
  productId: (value: number) => {
    if (!value) {
      return 'groupBuying.validation.item_required';
    }
    return null;
  },
  originalPrice: (value: number) => {
    if (!value || value <= 0) {
      return 'groupBuying.validation.original_price_required';
    }
    return null;
  },
  dealPrice: (value: number, originalPrice?: number) => {
    if (!value || value <= 0) {
      return 'groupBuying.validation.deal_price_required';
    }
    if (originalPrice && value >= originalPrice) {
      return 'groupBuying.validation.deal_price_must_be_lower';
    }
    return null;
  },
  minParticipants: (value: number) => {
    if (!value || value < 1) {
      return 'groupBuying.validation.min_participants_required';
    }
    return null;
  },
  maxParticipants: (value: number, minParticipants?: number) => {
    if (!value || value < 1) {
      return 'groupBuying.validation.max_participants_required';
    }
    if (minParticipants && value < minParticipants) {
      return 'groupBuying.validation.max_participants_too_low';
    }
    return null;
  },
  startTime: (value: string) => {
    if (!value) {
      return 'groupBuying.validation.start_time_required';
    }
    return null;
  },
  endTime: (value: string, startTime?: string) => {
    if (!value) {
      return 'groupBuying.validation.end_time_required';
    }
    if (startTime && new Date(value) <= new Date(startTime)) {
      return 'groupBuying.validation.end_time_must_be_after_start';
    }
    return null;
  },
};
