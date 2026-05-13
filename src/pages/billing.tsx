import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function BillingPlaceholder() {
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
