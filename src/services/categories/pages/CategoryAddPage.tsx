import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * CategoryAddPage - Redirects to /categories?add=1
 *
 * The add flow now uses CategoryAddModal inside the categories tree page.
 * This route is kept for backward compatibility (deep links, bookmarks).
 */
export function CategoryAddPage() {
  const router = useRouter();

  useEffect(() => {
    void router.replace('/categories?add=1');
  }, [router]);

  return null;
}

export default CategoryAddPage;
