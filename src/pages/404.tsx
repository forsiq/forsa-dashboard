import Link from 'next/link';

/**
 * Custom 404 — required when using `pages/_error.tsx` so Next can statically optimize not-found.
 * @see https://nextjs.org/docs/messages/custom-error-no-custom-404
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-obsidian-outer text-zinc-text px-6">
      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-muted mb-2">Forsa</p>
      <h1 className="text-5xl font-black tracking-tighter text-brand mb-2">404</h1>
      <p className="text-sm text-zinc-muted font-bold text-center max-w-md mb-8">
        This route does not exist or was removed.
      </p>
      <Link
        href="/dashboard"
        className="text-xs font-black uppercase tracking-widest text-brand hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
