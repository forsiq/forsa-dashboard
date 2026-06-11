'use client';

import type { ComponentProps } from 'react';
import { AmberTopbar } from '@yousef2001/core-ui/layout/components/Topbar';
import { isPathAllowedForRole } from '@core/auth/navRoleAccess';
import { useDashboardRole } from '@core/hooks/useDashboardRole';

type ForsaTopbarProps = Omit<ComponentProps<typeof AmberTopbar>, 'showSystemSettings'>;

/** Role-aware topbar: hides system settings link when the role lacks `/settings` access. */
export function ForsaTopbar(props: ForsaTopbarProps) {
  const { role } = useDashboardRole();
  return (
    <AmberTopbar
      {...props}
      showSystemSettings={isPathAllowedForRole('/settings', role)}
    />
  );
}
