import { useState, useCallback, useRef } from 'react';
import { uploadAttachmentAndGetId } from '@features/auctions/utils/auction-utils';

export interface UploadState {
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** Upload progress 0-100 */
  progress: number;
  /** Error message if upload failed */
  error: string | null;
  /** The attachment ID of the successfully uploaded file */
  attachmentId: number | null;
}

export interface UseFileUploadOptions {
  /** Called when upload succeeds with the attachment ID */
  onSuccess?: (attachmentId: number) => void;
  /** Called when upload fails with the error message */
  onError?: (error: string) => void;
  /** Called with progress updates (0-100) */
  onProgress?: (progress: number) => void;
}

export interface UseFileUploadReturn extends UploadState {
  /** Upload a single file using the presigned URL flow */
  upload: (file: File) => Promise<number | null>;
  /** Upload multiple files sequentially */
  uploadMultiple: (files: File[]) => Promise<number[]>;
  /** Reset state to initial values */
  reset: () => void;
}

const INITIAL_STATE: UploadState = {
  isUploading: false,
  progress: 0,
  error: null,
  attachmentId: null,
};

/**
 * Reusable hook for file uploads using the presigned URL flow.
 *
 * Handles the 3-step upload process (presigned URL → S3 → confirm)
 * with automatic token refresh and progress tracking.
 *
 * @example
 * ```tsx
 * const { upload, isUploading, progress, error, attachmentId } = useFileUpload({
 *   onSuccess: (id) => console.log('Uploaded:', id),
 * });
 *
 * // In form submit handler:
 * if (selectedFile) {
 *   const id = await upload(selectedFile);
 *   if (id) formData.attachmentIds = [id];
 * }
 * ```
 */
export function useFileUpload(options?: UseFileUploadOptions): UseFileUploadReturn {
  const [state, setState] = useState<UploadState>(INITIAL_STATE);
  const abortRef = useRef(false);

  const upload = useCallback(async (file: File): Promise<number | null> => {
    abortRef.current = false;
    setState({ isUploading: true, progress: 0, error: null, attachmentId: null });

    try {
      const id = await uploadAttachmentAndGetId(file, (progress) => {
        setState(prev => ({ ...prev, progress }));
        options?.onProgress?.(progress);
      });

      if (abortRef.current) return null;

      setState({ isUploading: false, progress: 100, error: null, attachmentId: id });
      options?.onSuccess?.(id);
      return id;
    } catch (err: any) {
      const message = err?.message || 'Upload failed. Please try again.';
      setState(prev => ({ ...prev, isUploading: false, error: message }));
      options?.onError?.(message);
      return null;
    }
  }, [options]);

  const uploadMultiple = useCallback(async (files: File[]): Promise<number[]> => {
    const ids: number[] = [];
    for (let i = 0; i < files.length; i++) {
      const id = await upload(files[i]);
      if (id) ids.push(id);
      if (abortRef.current) break;
    }
    return ids;
  }, [upload]);

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
