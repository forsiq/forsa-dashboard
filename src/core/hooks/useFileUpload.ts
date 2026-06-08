import { useState, useCallback, useRef } from 'react';
import { uploadAttachmentAndGetId } from '@features/auctions/utils/auction-utils';
import { uploadWithConcurrency } from '@core/utils/uploadWithConcurrency';

const INITIAL_STATE = {
  isUploading: false,
  progress: 0,
  error: null as string | null,
  attachmentId: null as number | null,
};

type FileUploadOptions = {
  onSuccess?: (id: number) => void;
  onError?: (message: string) => void;
  onProgress?: (progress: number) => void;
};

/**
 * Reusable hook for file uploads using the presigned URL flow.
 *
 * Overrides the package version with concurrent `uploadMultiple`.
 */
export function useFileUpload(options?: FileUploadOptions) {
  const [state, setState] = useState(INITIAL_STATE);
  const abortRef = useRef(false);

  const upload = useCallback(async (file: File): Promise<number | null> => {
    abortRef.current = false;
    setState({ isUploading: true, progress: 0, error: null, attachmentId: null });
    try {
      const id = await uploadAttachmentAndGetId(file, (progress) => {
        setState((prev) => ({ ...prev, progress }));
        options?.onProgress?.(progress);
      });
      if (abortRef.current) return null;
      setState({ isUploading: false, progress: 100, error: null, attachmentId: id });
      options?.onSuccess?.(id);
      return id;
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Upload failed. Please try again.';
      setState((prev) => ({ ...prev, isUploading: false, error: message }));
      options?.onError?.(message);
      return null;
    }
  }, [options]);

  const uploadMultiple = useCallback(async (files: File[]): Promise<number[]> => {
    abortRef.current = false;

    const ids = await uploadWithConcurrency<File, number>(
      files,
      async (file) => {
        if (abortRef.current) return null;
        const id = await uploadAttachmentAndGetId(file, (progress) => {
          options?.onProgress?.(progress);
        });
        return id ?? null;
      },
      {
        concurrency: 3,
        signal: abortRef.current ? AbortSignal.abort() : undefined,
      },
    );

    return ids;
  }, [options]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    upload,
    uploadMultiple,
    reset,
  };
}
