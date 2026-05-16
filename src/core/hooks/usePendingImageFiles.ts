import { useCallback, useRef, useState } from 'react';

/**
 * Tracks image previews (URLs) alongside pending File objects for multi-select upload.
 * Existing server images occupy indices [0, existingCount); new files map after that.
 */
export function usePendingImageFiles(initialPreviewUrls: string[] = []) {
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialPreviewUrls);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const existingCountRef = useRef(initialPreviewUrls.length);

  const resetFromServer = useCallback((urls: string[]) => {
    const list = urls ?? [];
    existingCountRef.current = list.length;
    setPreviewUrls(list);
    setPendingFiles([]);
  }, []);

  const appendFiles = useCallback((files: File[]) => {
    if (!files.length) return;
    setPendingFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  }, []);

  const removeAt = useCallback((index: number) => {
    setPreviewUrls((prev) => {
      const next = [...prev];
      const removed = next[index];
      if (removed?.startsWith('blob:')) {
        URL.revokeObjectURL(removed);
      }
      next.splice(index, 1);
      return next;
    });
    const pendingIndex = index - existingCountRef.current;
    if (pendingIndex >= 0) {
      setPendingFiles((prev) => prev.filter((_, i) => i !== pendingIndex));
    } else {
      existingCountRef.current = Math.max(0, existingCountRef.current - 1);
    }
  }, []);

  const reorder = useCallback((newOrder: string[]) => {
    setPreviewUrls(newOrder);
    // Pending files cannot be reordered independently without URL mapping; keep file order as-is.
  }, []);

  return {
    previewUrls,
    pendingFiles,
    existingCount: existingCountRef.current,
    appendFiles,
    removeAt,
    reorder,
    resetFromServer,
    setPreviewUrls,
  };
}
