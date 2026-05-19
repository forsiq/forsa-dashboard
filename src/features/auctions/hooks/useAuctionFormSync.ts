import { useEffect, useState } from 'react';
import type { Spec, Source } from '../types/auction.types';
import { parseAttachmentIds } from '../utils/auction-utils';

/**
 * Normalize fields that may come as JSON strings from the backend.
 * The backend sometimes returns arrays as serialized JSON strings (e.g. `'["url"]'`).
 */
const normalize = (val: unknown, fallback: unknown[] = []): unknown[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

interface UseAuctionFormSyncOptions {
  existingAuction: any;
  isEdit: boolean;
  isClone: boolean;
  setFormData: (data: any) => void;
  setDurationDays: (days: number) => void;
  resetFromServer: (urls: string[]) => void;
}

export function useAuctionFormSync({
  existingAuction,
  isEdit,
  isClone,
  setFormData,
  setDurationDays,
  resetFromServer,
}: UseAuctionFormSyncOptions) {
  const [retainedAttachmentIds, setRetainedAttachmentIds] = useState<number[]>([]);

  // Sync with existing auction if editing or cloning
  useEffect(() => {
    if (existingAuction) {
      const titleSuffix = isClone ? ' (Copy)' : '';
      const startTime = isClone ? '' : existingAuction.startTime?.split('Z')[0];
      const endTime = isClone ? '' : existingAuction.endTime?.split('Z')[0];
      let durationDaysFromAuction = 7;
      // Calculate duration in days from existing auction
      if (startTime && endTime) {
        const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
        durationDaysFromAuction = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        setDurationDays(durationDaysFromAuction);
      }
      setFormData({
        title: existingAuction.title + titleSuffix,
        description: existingAuction.description,
        startPrice: existingAuction.startPrice,
        reservePrice: existingAuction.reservePrice,
        startTime,
        endTime,
        bidIncrement: existingAuction.bidIncrement,
        categoryId: existingAuction.categoryId,
        durationDays: durationDaysFromAuction,
        images: normalize(existingAuction.images) as string[],
        specs: normalize(existingAuction.specs) as Spec[],
        sources: normalize(existingAuction.sources) as Source[],
      });
      const urls = normalize(existingAuction.images) as string[];
      resetFromServer(urls);
      setRetainedAttachmentIds(parseAttachmentIds(existingAuction.attachmentIds));
    }
  }, [isEdit, isClone, existingAuction, resetFromServer, setFormData, setDurationDays]);

  return { retainedAttachmentIds, setRetainedAttachmentIds };
}
