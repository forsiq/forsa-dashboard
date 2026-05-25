import type { getUser } from '@core/lib';

export interface AuthProfileSnapshot {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface TopbarUserDisplay {
  name: string;
  email: string;
  role?: string;
  initials: string;
}

function initialsFromName(fullName: string, fallback: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
  }
  const single = parts[0] ?? fallback;
  return single.slice(0, 2).toUpperCase() || 'U';
}

/** Build AmberTopbar `user` prop from auth cookie + optional profile API payload. */
export function buildTopbarUserDisplay(
  profile: AuthProfileSnapshot | null,
  cookieUser: ReturnType<typeof getUser> | null,
): TopbarUserDisplay {
  const first = (profile?.first_name ?? '').trim();
  const last = (profile?.last_name ?? '').trim();
  const fullName = [first, last].filter(Boolean).join(' ');

  const username = (profile?.username ?? cookieUser?.username ?? '').trim();
  const email = (profile?.email ?? cookieUser?.email ?? '').trim();

  const name = fullName || username || email || 'User';
  const initials = initialsFromName(fullName, username || email || 'User');

  return {
    name,
    email,
    role: username || undefined,
    initials,
  };
}
