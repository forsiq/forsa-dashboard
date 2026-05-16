import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** @deprecated Use /listings/[id]/publish */
export default function DeployListingRedirect() {
  const router = useRouter();
  const { id, type } = router.query;

  useEffect(() => {
    if (!router.isReady || !id) return;
    const query = type ? { type: String(type) } : {};
    router.replace({ pathname: `/listings/${id}/publish`, query });
  }, [router, id, type]);

  return null;
}
