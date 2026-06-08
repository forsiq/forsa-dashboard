/**
 * Upload files with bounded concurrency while preserving order.
 *
 * @param files     Items to process
 * @param uploadFn  Async function that processes a single item and returns a result (or null on failure)
 * @param opts.concurrency  Max parallel uploads (default 3)
 * @param opts.onProgress  Called with (completed, total) after each item finishes
 * @param opts.signal      AbortSignal to cancel remaining items
 */
export async function uploadWithConcurrency<T, R>(
  files: T[],
  uploadFn: (file: T, index: number) => Promise<R | null>,
  opts?: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
    signal?: AbortSignal;
  },
): Promise<R[]> {
  const { concurrency = 3, onProgress, signal } = opts ?? {};
  const total = files.length;
  if (total === 0) return [];

  const results: (R | null)[] = new Array(total).fill(null);
  let nextIndex = 0;
  let completedCount = 0;

  async function worker(): Promise<void> {
    while (nextIndex < total) {
      if (signal?.aborted) return;
      const idx = nextIndex++;
      const result = await uploadFn(files[idx], idx);
      results[idx] = result;
      completedCount++;
      onProgress?.(completedCount, total);
    }
  }

  const workerCount = Math.min(concurrency, total);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results.filter((r): r is R => r !== null);
}
