'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Maximize2 } from 'lucide-react';
import { AmberSlideOver } from '@core/components/AmberSlideOver';
import { cn } from '@core/lib/utils/cn';

interface StatValueProps {
  value: string | number;
  maxLines?: number;
  className?: string;
}

// Tailwind JIT can't detect dynamic class names, so we map to static classes
const lineClampClasses: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
};

export const StatValue: React.FC<StatValueProps> = ({
  value,
  maxLines = 2,
  className,
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const text = String(value);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const needsClamping = text.length > 20;
  const clampedClass = needsClamping ? (lineClampClasses[maxLines] || 'line-clamp-2') : '';

  return (
    <>
      <div className="min-w-0 flex-1 flex items-center gap-1.5">
        <span
          ref={textRef}
          title={text}
          className={cn(
            'text-3xl font-black text-zinc-text tracking-tight tabular-nums leading-none break-words',
            clampedClass,
            className,
          )}
        >
          {value}
        </span>
        {needsClamping && (
          <button
            type="button"
            onClick={handleExpand}
            className="shrink-0 p-1 rounded-md text-zinc-muted hover:text-zinc-text hover:bg-white/5 transition-colors"
            aria-label="Expand value"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AmberSlideOver
        isOpen={isExpanded}
        onClose={handleClose}
        title="Value"
      >
        <div className="p-6">
          <p className="text-lg font-bold text-zinc-text break-words whitespace-pre-wrap leading-relaxed">
            {text}
          </p>
        </div>
      </AmberSlideOver>
    </>
  );
};

export default StatValue;
