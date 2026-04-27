import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AmberButton } from '../AmberButton';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Failed to load data',
  onRetry,
  retryLabel = 'Retry',
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <AlertCircle className="h-16 w-16 text-zinc-600 mb-4" />
    <h3 className="text-lg font-semibold text-white mb-2">{message}</h3>
    {onRetry && (
      <AmberButton variant="ghost" size="sm" onClick={onRetry}>
        <RefreshCw className="w-3 h-3" />
        {retryLabel}
      </AmberButton>
    )}
  </div>
);
