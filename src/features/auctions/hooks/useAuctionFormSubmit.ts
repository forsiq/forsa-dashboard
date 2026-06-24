import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMapApiValidationError } from '@core/hooks/useMapApiValidationError';
import { useFileUpload } from '@core/hooks/useFileUpload';
import { useCreateAuction, useUpdateAuction } from '../api';
import { zodIssuesToFieldMap } from '@core/validation/zodIssuesToFieldMap';
import { createAuctionFormPageSchema } from '../validation/auctionFormPageSchema';
import type { AuctionCreateInput, AuctionUpdateInput, Spec, Source } from '../types/auction.types';
import type { FormData } from './useAuctionFormState';

/**
 * Normalize fields that may come as JSON strings from the backend.
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

interface UseAuctionFormSubmitOptions {
  formData: FormData;
  setErrors: (errors: Record<string, string>) => void;
  useDurationMode: boolean;
  computedEndTime: string;
  imageUpload: {
    pendingFiles: File[];
  };
  retainedAttachmentIds: number[];
  markClean: () => void;
  isEdit: boolean;
  auctionId: number;
  t: (key: string) => string;
}

export function useAuctionFormSubmit({
  formData,
  setErrors,
  useDurationMode,
  computedEndTime,
  imageUpload,
  retainedAttachmentIds,
  markClean,
  isEdit,
  auctionId,
  t,
}: UseAuctionFormSubmitOptions) {
  const router = useRouter();
  const mapApiError = useMapApiValidationError();
  const createMutation = useCreateAuction();
  const updateMutation = useUpdateAuction();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { uploadMultiple, isUploading, progress: uploadProgress, error: uploadError, reset: resetUpload } = useFileUpload();

  const validate = () => {
    const finalEndTime = useDurationMode ? computedEndTime : formData.endTime;
    const resRaw = formData.reservePrice;
    const parsed = createAuctionFormPageSchema(t).safeParse({
      title: formData.title ?? '',
      startPrice: Number(formData.startPrice),
      bidIncrement: Number(formData.bidIncrement),
      categoryId: Number(formData.categoryId),
      startTime: formData.startTime ?? '',
      endTime: finalEndTime ?? '',
      reservePrice:
        resRaw !== undefined &&
        resRaw !== null &&
        Number.isFinite(Number(resRaw)) &&
        Number(resRaw) > 0
          ? Number(resRaw)
          : undefined,
    });
    if (!parsed.success) {
      setErrors(zodIssuesToFieldMap(parsed.error));
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitError(null);

      if (isEdit) {
        const finalEndTime = useDurationMode ? computedEndTime : formData.endTime;
        const resRaw = formData.reservePrice;
        await updateMutation.mutateAsync({
          id: auctionId,
          title: formData.title,
          description: formData.description,
          categoryId: Number(formData.categoryId),
          startPrice: Number(formData.startPrice),
          bidIncrement: Number(formData.bidIncrement),
          startTime: formData.startTime ? new Date(formData.startTime).toISOString() : undefined,
          endTime: finalEndTime ? new Date(finalEndTime).toISOString() : undefined,
          reservePrice:
            resRaw !== undefined &&
            resRaw !== null &&
            Number.isFinite(Number(resRaw)) &&
            Number(resRaw) > 0
              ? Number(resRaw)
              : undefined,
        } as AuctionUpdateInput);
        markClean();
        router.push('/auctions');
        return;
      }

      const newAttachmentIds =
        imageUpload.pendingFiles.length > 0
          ? await uploadMultiple(imageUpload.pendingFiles)
          : [];
      if (imageUpload.pendingFiles.length > 0 && newAttachmentIds.length === 0) {
        setSubmitError(uploadError || t('auction.validation.upload_failed') || 'Image upload failed.');
        return;
      }
      // Remove productId from payload - it's only used for auto-fill, not accepted by backend DTO
      const { productId, durationDays: _durationDays, ...formPayload } = formData;
      const finalEndTime = useDurationMode ? computedEndTime : formData.endTime;
      const payload: any = {
        ...formPayload,
        images: normalize(formPayload.images) as string[],
        specs: normalize(formPayload.specs) as Spec[],
        sources: normalize(formPayload.sources) as Source[],
        endTime: finalEndTime ? new Date(finalEndTime).toISOString() : undefined,
      };
      const allAttachmentIds = [...retainedAttachmentIds, ...newAttachmentIds];
      if (allAttachmentIds.length > 0) {
        payload.mainAttachmentId = allAttachmentIds[0];
        payload.attachmentIds = allAttachmentIds;
      }

      await createMutation.mutateAsync(payload as AuctionCreateInput);
      markClean();
      router.push('/auctions');
    } catch (err: any) {
      const mapped = mapApiError(err);
      const errorMessage =
        mapped ||
        err?.message ||
        err?.details?.[0] ||
        t('auction.validation.submit_failed') ||
        'Submission failed. Please check your data and try again.';
      setSubmitError(typeof errorMessage === 'string' ? errorMessage : String(errorMessage));
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return {
    submitError,
    setSubmitError,
    handleSubmit,
    isSubmitting,
    isUploading,
    uploadProgress,
    uploadError,
    resetUpload,
    createMutation,
    updateMutation,
  };
}
