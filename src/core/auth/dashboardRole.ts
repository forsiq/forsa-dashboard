/**
 * Shared JWT → Forsa dashboard role resolution.
 * Used by proxy (edge/node), RoleGuard, and ForsaSidebar so route checks match sidebar visibility.
 */
import Cookies from 'js-cookie';
import type { JwtPayload, UserRole } from '@features/auth/types';

export const DASHBOARD_ROLES: readonly UserRole[] = [
  'admin',
  'merchant',
  'customer_support',
  'product_analyst',
  'product_moderator',
] as const;

const ROLE_PRIORITY: UserRole[] = [...DASHBOARD_ROLES];

/** Legacy / auth-service role strings → dashboard UserRole */
const ROLE_ALIASES: Record<string, UserRole> = {
  manager: 'product_analyst',
  staff: 'customer_support',
  seller: 'merchant',
  vendor: 'merchant',
  moderator: 'product_moderator',
  support: 'customer_support',
  employee: 'customer_support',
  customer: 'customer_support',
  user: 'customer_support',
  buyer: 'customer_support',
  developer: 'admin',
  product_moderator: 'product_moderator',
};

function resolveRoleToken(value: string | undefined): UserRole | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().toLowerCase();
  if ((DASHBOARD_ROLES as readonly string[]).includes(normalized)) {
    return normalized as UserRole;
  }
  return ROLE_ALIASES[normalized] ?? null;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const jsonPayload = atob(padded);
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

function collectRoleCandidates(payload: JwtPayload): string[] {
  const out: string[] = [];
  const push = (v: unknown) => {
    if (typeof v === 'string' && v.trim()) out.push(v.trim().toLowerCase());
  };
  push(payload.role);
  if (Array.isArray(payload.roles)) {
    for (const r of payload.roles) push(r);
  }
  push(payload.platform_role);
  push(payload.business_role);
  push(payload.collaborator_role);
  return out;
}

/**
 * Resolve the effective dashboard role from JWT claims (single source of truth).
 */
export function extractDashboardRole(payload: JwtPayload | null): UserRole {
  if (!payload) return 'customer_support';

  // Project collaborator business_role (zv-auth) — highest priority for Forsa merchants
  const fromBusiness = resolveRoleToken(payload.business_role);
  if (fromBusiness) return fromBusiness;

  // Auth mirrors business_role into `role` when project context is present at login
  const fromRoleClaim = resolveRoleToken(payload.role);
  if (fromRoleClaim) return fromRoleClaim;

  const candidates = collectRoleCandidates(payload);

  for (const preferred of ROLE_PRIORITY) {
    if (candidates.includes(preferred)) return preferred;
  }

  for (const c of candidates) {
    const mapped = ROLE_ALIASES[c];
    if (mapped) return mapped;
  }

  return 'customer_support';
}

export function extractDashboardRoleFromToken(token: string | undefined | null): UserRole {
  if (!token) return 'customer_support';
  return extractDashboardRole(decodeJwtPayload(token));
}

/** Whether a dashboard role is allowed for a protected route list. */
export function isDashboardRoleAllowed(
  allowedRoles: readonly string[],
  dashboardRole: UserRole,
): boolean {
  return allowedRoles.includes(dashboardRole);
}

export interface RoleDebugInfo {
  resolvedRole: UserRole;
  rawClaims: {
    role?: string;
    roles?: string[];
    platform_role?: string;
    business_role?: string;
    collaborator_role?: string;
  };
  tokenPresent: boolean;
}

export function getRoleDebugInfo(): RoleDebugInfo {
  const token = typeof window !== 'undefined' ? Cookies.get('access') : undefined;
  const payload = token ? decodeJwtPayload(token) : null;
  return {
    resolvedRole: extractDashboardRole(payload),
    rawClaims: {
      role: payload?.role,
      roles: payload?.roles,
      platform_role: payload?.platform_role,
      business_role: payload?.business_role,
      collaborator_role: payload?.collaborator_role,
    },
    tokenPresent: !!token,
  };
}
