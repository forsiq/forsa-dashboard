import { useEffect, useState } from 'react';
import { getAccessToken, getUser } from '@core/lib';
import { AUTH_API_BASE } from '@config/api';
import {
  buildTopbarUserDisplay,
  type AuthProfileSnapshot,
  type TopbarUserDisplay,
} from '@core/utils/topbarUser';

async function fetchAuthProfile(): Promise<AuthProfileSnapshot | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${AUTH_API_BASE}user/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Project-ID': '11',
        'X-Project': '11',
      },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

/** Resolves display name/email for AmberTopbar from cookies + auth profile API. */
export function useTopbarUser(): TopbarUserDisplay | undefined {
  const [topbarUser, setTopbarUser] = useState<TopbarUserDisplay | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const cookieUser = getUser();
    if (!cookieUser && !getAccessToken()) {
      setTopbarUser(undefined);
      return;
    }

    setTopbarUser(buildTopbarUserDisplay(null, cookieUser));

    fetchAuthProfile().then((profile) => {
      if (cancelled) return;
      setTopbarUser(buildTopbarUserDisplay(profile, getUser() ?? cookieUser));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return topbarUser;
}
