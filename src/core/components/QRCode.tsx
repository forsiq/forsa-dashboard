'use client';

import React, { useEffect, useRef, useState } from 'react';

type QRCodeCompProps = {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
};

interface QRCodeLibraryType {
  QRCodeCanvas: React.FC<QRCodeCompProps>;
  QRCodeSVG: React.FC<QRCodeCompProps>;
}

export interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  /** Render mode: canvas (default) or svg. Falls back to text if library missing. */
  mode?: 'canvas' | 'svg';
  /** Optional title/aria-label for the rendered QR. */
  title?: string;
}

/**
 * Wrapper around the optional `qrcode.react` package.
 *
 * IMPORTANT: `qrcode.react` is NOT installed by default in auction2. The
 * component gracefully falls back to rendering the raw value as monospace
 * text when the package is unavailable. To enable real QR rendering install
 * the package and it will be picked up automatically:
 *
 *   npm install qrcode.react
 *
 * Until then, the fallback keeps the rest of the shipping UI functional
 * (the QrReceiptModal still shows the qr_id value + print button).
 */
export function QRCode({
  value,
  size = 128,
  className,
  mode = 'canvas',
  title,
}: QRCodeProps): React.ReactElement {
  const [lib, setLib] = useState<QRCodeLibraryType | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const canvasContainerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Dynamic import so this never breaks the build when the package is absent.
    import(/* webpackMode: "weak" */ 'qrcode.react')
      .then((mod: QRCodeLibraryType) => {
        if (!cancelled) setLib(mod);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (lib) {
    const Comp = mode === 'svg' ? lib.QRCodeSVG : lib.QRCodeCanvas;
    return (
      <span
        ref={canvasContainerRef}
        className={className}
        role="img"
        aria-label={title ?? 'QR code'}
        title={title}
      >
        <Comp value={value || ' '} size={size} level="M" includeMargin />
      </span>
    );
  }

  // Fallback: render the value as monospace text inside a square box.
  return (
    <span
      className={
        className ??
        'inline-flex items-center justify-center bg-white text-black rounded-lg font-mono text-xs break-all p-2'
      }
      role="img"
      aria-label={title ?? 'QR code (fallback)'}
      title={title ?? value}
      style={{ width: size, height: size, overflow: 'hidden' }}
    >
      {loadFailed ? value : '...'}
    </span>
  );
}

export default QRCode;
