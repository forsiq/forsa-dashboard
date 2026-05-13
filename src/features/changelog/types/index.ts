export type ChangeType = 'added' | 'fixed' | 'improved' | 'changed';

/** Localized text — keys are ISO 639-1 language codes (en, ar, ku, ...) */
export type LocalizedText = Record<string, string>;

export interface ChangelogChange {
  /** Localized descriptions keyed by language code */
  description: LocalizedText;
  type: ChangeType;
  /** Optional sidebar path this change relates to (for "NEW" badge) */
  sidebarPath?: string;
}

export interface ChangelogRelease {
  version: string;
  date: string; // ISO 8601 date string
  /** Localized title keyed by language code */
  title: LocalizedText;
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
