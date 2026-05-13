import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SupportPlaceholder() {
  const router = useRouter();
  useEffect(() => {
    void router.replace('/about');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-outer text-zinc-muted text-xs font-mono">
      …
    </div>
  );
}
