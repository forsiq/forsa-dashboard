'use client';

import type { ComponentProps } from 'react';
import { useEffect, useRef } from 'react';
import { AmberTopbar } from '@yousef2001/core-ui/layout/components/Topbar';
import { isPathAllowedForRole } from '@core/auth/navRoleAccess';
import { useDashboardRole } from '@core/hooks/useDashboardRole';

type ForsaTopbarProps = ComponentProps<typeof AmberTopbar>;

const HIDDEN_PATHS = ['/settings', '/billing'] as const;

/** Role-aware topbar: hides system settings and billing links via DOM when the role lacks access. */
export function ForsaTopbar(props: ForsaTopbarProps) {
  const { role } = useDashboardRole();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const canAccess = isPathAllowedForRole('/settings', role);
    if (canAccess) return;

    // Hide links by href attribute
    const links = wrapperRef.current.querySelectorAll('a[href="/settings"], a[href="/billing"]');
    links.forEach(link => {
      (link as HTMLElement).style.display = 'none';
    });
  }, [role]);

  return (
    <div ref={wrapperRef}>
      <AmberTopbar {...props} />
    </div>
  );
}
