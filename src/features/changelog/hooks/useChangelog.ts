'use client';

import { useState, useCallback } from 'react';
import dayjs from 'dayjs';

import releasesData from '@features/changelog/data/releases.json';
import type { ChangelogRelease, ChangelogState } from '@features/changelog/types';

const STORAGE_KEY = 'forsa_changelog_last_seen';
const NEW_DURATION_DAYS = 30;

function getSeenVersion(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function setSeenVersion(version: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSeenVersion();
    if (!current || version > current) {
      localStorage.setItem(STORAGE_KEY, version);
    }
  } catch {
    // ignore storage errors
  }
}

function isReleaseNew(release: ChangelogRelease): boolean {
  return dayjs().diff(dayjs(release.date), 'day') < NEW_DURATION_DAYS;
}

export function useChangelog(): ChangelogState {
  const releases = releasesData as ChangelogRelease[];
  const [, bump] = useState(0);

  const unseenCount = (() => {
    const seenVersion = getSeenVersion();
    if (!seenVersion) return releases.length;
    return releases.filter(r => r.version > seenVersion).length;
  })();

  const isNewFeature = useCallback(
    (path: string): boolean => {
      const seenVersion = getSeenVersion();
      return releases.some(release => {
        if (seenVersion && release.version <= seenVersion) return false;
        if (!isReleaseNew(release)) return false;
        return release.entries.some(
          entry => entry.sidebarPath === path,
        );
      });
    },
    [releases],
  );

  const markAllAsSeen = useCallback(() => {
    if (releases.length === 0) return;
    const latestVersion = releases[0].version;
    setSeenVersion(latestVersion);
    bump(v => v + 1);
  }, [releases]);

  const markVersionSeen = useCallback((version: string) => {
    setSeenVersion(version);
    bump(v => v + 1);
  }, []);

  return {
    releases,
    unseenCount,
    isNewFeature,
    markAllAsSeen,
    markVersionSeen,
  };
}
