import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProfilePlaceholder() {
  const router = useRouter();
  useEffect(() => {
    void router.replace('/settings');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-outer text-zinc-muted text-xs font-mono">
      …
    </div>
  );
}
