import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function BillingRedirect() {
  const router = useRouter();
  useEffect(() => {
    void router.replace('/settings?tab=payments');
  }, [router]);
  return null;
}
