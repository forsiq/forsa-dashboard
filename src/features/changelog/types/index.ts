export type ChangeType = 'added' | 'fixed' | 'improved' | 'changed';

export interface ChangelogChange {
  description: string;
  type: ChangeType;
  /** Optional sidebar path this change relates to (for "NEW" badge) */
  sidebarPath?: string;
}

export interface ChangelogRelease {
  version: string;
  date: string; // ISO 8601 date string
  title: string;
  entries: ChangelogChange[];
}

export interface ChangelogState {
  releases: ChangelogRelease[];
  unseenCount: number;
  /** Returns true if the given sidebar path has a new (unseen + within 30 days) entry */
  isNewFeature: (path: string) => boolean;
  /** Mark all current releases as seen in localStorage */
  markAllAsSeen: () => void;
  /** Mark a specific version as seen */
  markVersionSeen: (version: string) => void;
}
