type SessionListener = () => void;

let listeners: SessionListener[] = [];
let lastEmitted = 0;
const DEDUP_MS = 5000;

export function onSessionExpired(listener: SessionListener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function emitSessionExpired(): void {
  const now = Date.now();
  if (now - lastEmitted < DEDUP_MS) return;
  lastEmitted = now;
  listeners.forEach(l => l());
}
