import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Topbar links here — redirect until a real notifications UI exists. */
export default function NotificationsPlaceholder() {
  const router = useRouter();
  useEffect(() => {
    void router.replace('/dashboard');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-outer text-zinc-muted text-xs font-mono">
      …
    </div>
  );
}
