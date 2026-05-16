import { useCallback, useSyncExternalStore } from 'react';

export type SidebarMode = 'modular' | 'unified';

const STORAGE_KEY = 'forsa-sidebar-mode';
const listeners = new Set<() => void>();

function readModeFromStorage(): SidebarMode {
  if (typeof window === 'undefined') return 'unified';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'unified' || stored === 'modular') return stored;
  } catch {
    /* ignore */
  }
  return 'unified';
}

function emitChange() {
  listeners.forEach(fn => fn());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function useSidebarMode(): { mode: SidebarMode; setMode: (mode: SidebarMode) => void } {
  const mode = useSyncExternalStore(subscribe, readModeFromStorage, () => 'unified' as SidebarMode);

  const setMode = useCallback((next: SidebarMode) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    emitChange();
  }, []);

  return { mode, setMode };
}
