import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { ListPageSkeleton } from '@core/loading';

export function createClientReportPage<P = Record<string, never>>(
  loader: () => Promise<{ default: ComponentType<P> }>,
) {
  return dynamic(loader, {
    ssr: false,
    loading: () => <ListPageSkeleton count={4} columns={2} />,
  });
}
