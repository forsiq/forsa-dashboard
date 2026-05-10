import React from 'react';
import { cn } from '@core/lib/utils/cn';

interface IqdSymbolProps {
  className?: string;
}

/**
 * Iraqi Dinar (IQD) currency symbol.
 *
 * Use as the `icon` prop of `AmberInput` for price/amount fields, or as a
 * standalone visual indicator of IQD currency in form section headers.
 *
 * The default size matches `lucide-react` icons used elsewhere (w-4 h-4
 * inside inputs, w-5 h-5 inside section icon boxes). Pass a `className`
 * to override.
 */
export const IqdSymbol: React.FC<IqdSymbolProps> = ({ className }) => (
  <span
    aria-label="IQD"
    className={cn(
      'inline-flex items-center justify-center font-black tabular-nums leading-none select-none',
      'text-xs',
      className,
    )}
  >
    د.ع
  </span>
);

export default IqdSymbol;
