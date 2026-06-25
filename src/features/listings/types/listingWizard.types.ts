export type ListingWizardMode = 'create' | 'edit' | 'publish-only';

export interface ListingWizardPageProps {
  mode?: ListingWizardMode;
  /** Last step number (e.g. 5 for catalog-only edit). */
  maxStep?: number;
}
