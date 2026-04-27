import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Basic redirect logic, AuthGuard will handle the rest
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-zinc-muted font-bold font-mono animate-pulse">
      ...
    </div>
  );
}
