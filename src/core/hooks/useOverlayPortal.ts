'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export const OVERLAY_TRANSITION_MS = 300;

const PORTAL_ROOT_ID = 'forsa-overlay-portal-root';

/** Single DOM host for all overlay portals — avoids competing direct children on document.body. */
export function getOverlayPortalRoot(): HTMLElement {
  if (typeof document === 'undefined') {
    throw new Error('getOverlayPortalRoot requires browser environment');
  }
  let el = document.getElementById(PORTAL_ROOT_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = PORTAL_ROOT_ID;
    document.body.appendChild(el);
  }
  return el;
}

/**
 * Keeps portal content mounted through CSS exit transitions.
 * Closes on route change to avoid removeChild races during Next.js page swaps.
 */
export function useOverlayPortal(isOpen: boolean, onClose?: () => void) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleRouteChange = () => onClose();
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [isOpen, onClose, router.events]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleEsc);
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = original;
      };
    }

    const timer = window.setTimeout(() => setIsVisible(false), OVERLAY_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, onClose]);

  const shouldRender = mounted && (isVisible || isOpen);

  return { shouldRender, isOpen };
}
