'use client';

import React from 'react';
import { ChangelogSection as CoreChangelogSection } from '@core/features/changelog/components/ChangelogSection';
import releasesData from '@features/changelog/data/releases.yaml';
import type { ChangelogRelease } from '@features/changelog/types';

const FORSA_STORAGE_KEY = 'forsa_changelog_last_seen';

interface ForsaChangelogSectionProps {
  className?: string;
}

export const ChangelogSection: React.FC<ForsaChangelogSectionProps> = ({ className }) => {
  return (
    <CoreChangelogSection
      releases={releasesData as ChangelogRelease[]}
      storageKey={FORSA_STORAGE_KEY}
      className={className}
    />
  );
};
