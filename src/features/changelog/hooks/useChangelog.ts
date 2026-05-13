'use client';

import { useChangelog as useCoreChangelog } from '@core/features/changelog/hooks/useChangelog';
import releasesData from '@features/changelog/data/releases.yaml';
import type { ChangelogRelease, ChangelogState } from '@features/changelog/types';

const FORSA_STORAGE_KEY = 'forsa_changelog_last_seen';

export function useChangelog(): ChangelogState {
  return useCoreChangelog({
    releases: releasesData as ChangelogRelease[],
    storageKey: FORSA_STORAGE_KEY,
  });
}
