import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GroupBuyingNewRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) router.replace('/listings/new');
  }, [router]);

  return null;
}
