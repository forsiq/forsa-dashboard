import { useState } from 'react';
import type { AuctionCreateInput, Spec, Source } from '../types/auction.types';

const HISTORY_KEY = 'history_auction';

function readAuctionHistory(): Record<string, any> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export type FormData = Partial<AuctionCreateInput> & { productId?: number; durationDays?: number };

export function useAuctionFormState() {
  const [formData, setFormData] = useState<FormData>(() => {
    const h = readAuctionHistory();
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + (h?.durationDays ?? 7));
    end.setHours(end.getHours() + 1, 0, 0, 0);
    return {
      title: '',
      description: '',
      startPrice: h?.startPrice ?? 0,
      reservePrice: undefined,
      startTime: now.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16),
      bidIncrement: h?.bidIncrement ?? 5000,
      categoryId: h?.categoryId ?? 1,
      durationDays: h?.durationDays ?? 7,
      images: [],
      productId: undefined,
      specs: [],
      sources: [],
    };
  });

  const initialFormData: Partial<AuctionCreateInput> & { productId?: number } = {
    title: '',
    description: '',
    startPrice: 0,
    reservePrice: undefined,
    startTime: (() => {
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      return now.toISOString().slice(0, 16);
    })(),
    endTime: (() => {
      const end = new Date();
      end.setDate(end.getDate() + 7);
      end.setHours(end.getHours() + 1, 0, 0, 0);
      return end.toISOString().slice(0, 16);
    })(),
    bidIncrement: 5000,
    categoryId: 1,
    images: [],
    productId: undefined,
    specs: [],
    sources: [],
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any, inventoryItems?: any[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    // Auto-fill from inventory if choosing a product
    if (field === 'productId' && value && inventoryItems) {
      const item = inventoryItems.find((i: any) => String(i.id) === value);
      if (item) {
        setFormData(prev => ({
          ...prev,
          title: item.name,
          description: item.description || '',
          startPrice: item.price || 0,
          images: item.image_url ? [item.image_url] : prev.images,
        }));
      }
    }
  };

  return { formData, setFormData, errors, setErrors, handleChange, initialFormData };
}
