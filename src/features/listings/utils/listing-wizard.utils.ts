/** Merchant / trader: product + media only (no channel / publish). */
export const MERCHANT_WIZARD_STEP_IDS = ['product', 'media'] as const;

export const MERCHANT_WIZARD_STEP = {
  PRODUCT: 1,
  MEDIA: 2,
} as const;

export const MERCHANT_STEP_LABEL_KEYS = [
  'listing.wizard.step.product',
  'listing.wizard.step.media',
] as const;

/** Desktop: full wizard with a dedicated details step. */
export const DESKTOP_WIZARD_STEP_IDS = [
  'product',
  'details',
  'media',
  'channel',
  'publish',
] as const;

/** Mobile: essentials + optional sections collapsed. */
export const MOBILE_WIZARD_STEP_IDS = [
  'product',
  'media',
  'channel',
  'publish',
] as const;

export type DesktopWizardStepId = (typeof DESKTOP_WIZARD_STEP_IDS)[number];
export type MobileWizardStepId = (typeof MOBILE_WIZARD_STEP_IDS)[number];
export type WizardStepId = DesktopWizardStepId | MobileWizardStepId;

export const DESKTOP_WIZARD_STEP = {
  PRODUCT: 1,
  DETAILS: 2,
  MEDIA: 3,
  CHANNEL: 4,
  PUBLISH: 5,
} as const;

export const MOBILE_WIZARD_STEP = {
  PRODUCT: 1,
  MEDIA: 2,
  CHANNEL: 3,
  PUBLISH: 4,
} as const;

export const DESKTOP_STEP_LABEL_KEYS = [
  'listing.wizard.step.product',
  'listing.wizard.step.details',
  'listing.wizard.step.media',
  'listing.wizard.step.channel',
  'listing.wizard.step.publish',
] as const;

export const MOBILE_STEP_LABEL_KEYS = [
  'listing.wizard.step.product',
  'listing.wizard.step.media',
  'listing.wizard.step.channel',
  'listing.wizard.step.publish',
] as const;

export type WizardStepMap =
  | typeof DESKTOP_WIZARD_STEP
  | typeof MOBILE_WIZARD_STEP
  | typeof MERCHANT_WIZARD_STEP;

export interface WizardLayout {
  isMobile: boolean;
  step: WizardStepMap;
  totalSteps: number;
  stepIds: readonly WizardStepId[];
  stepLabelKeys: readonly string[];
}

export interface WizardLayoutOptions {
  /** Trader / merchant: only product + media (steps 1–2). */
  merchant?: boolean;
}

export function getWizardLayout(
  isMobile: boolean,
  options?: WizardLayoutOptions,
): WizardLayout {
  if (options?.merchant) {
    return {
      isMobile,
      step: MERCHANT_WIZARD_STEP,
      totalSteps: MERCHANT_WIZARD_STEP_IDS.length,
      stepIds: MERCHANT_WIZARD_STEP_IDS,
      stepLabelKeys: MERCHANT_STEP_LABEL_KEYS,
    };
  }

  if (isMobile) {
    return {
      isMobile: true,
      step: MOBILE_WIZARD_STEP,
      totalSteps: MOBILE_WIZARD_STEP_IDS.length,
      stepIds: MOBILE_WIZARD_STEP_IDS,
      stepLabelKeys: MOBILE_STEP_LABEL_KEYS,
    };
  }
  return {
    isMobile: false,
    step: DESKTOP_WIZARD_STEP,
    totalSteps: DESKTOP_WIZARD_STEP_IDS.length,
    stepIds: DESKTOP_WIZARD_STEP_IDS,
    stepLabelKeys: DESKTOP_STEP_LABEL_KEYS,
  };
}

/** @deprecated Use getWizardLayout(isMobile).step */
export const WIZARD_STEP = MOBILE_WIZARD_STEP;
/** @deprecated Use getWizardLayout(isMobile).totalSteps */
export const WIZARD_TOTAL_STEPS = MOBILE_WIZARD_STEP_IDS.length;
/** @deprecated Use getWizardLayout(isMobile).stepIds */
export const WIZARD_STEP_IDS = MOBILE_WIZARD_STEP_IDS;

export function normalizeWizardStepFromQuery(
  queryStep: number | undefined,
  maxStep: number,
  isMobile: boolean,
  options?: WizardLayoutOptions,
): number {
  const layout = getWizardLayout(isMobile, options);
  if (!queryStep || queryStep < 1) return layout.step.PRODUCT;
  const capped = Math.min(queryStep, layout.totalSteps);
  return Math.max(layout.step.PRODUCT, Math.min(maxStep, capped));
}

export function remapWizardStep(
  currentStep: number,
  fromMobile: boolean,
  toMobile: boolean,
  options?: WizardLayoutOptions,
): number {
  if (fromMobile === toMobile) {
    return Math.min(currentStep, getWizardLayout(toMobile, options).totalSteps);
  }
  const from = getWizardLayout(fromMobile, options);
  const to = getWizardLayout(toMobile, options);
  const stepId = from.stepIds[currentStep - 1];
  if (!stepId) return to.step.PRODUCT;
  const targetIndex = to.stepIds.indexOf(stepId);
  return targetIndex >= 0 ? targetIndex + 1 : to.step.PRODUCT;
}

export function filterSpecs<T extends { label?: string; value?: string }>(specs: T[]): T[] {
  return specs.filter(
    (s) => (s.label?.trim() ?? '') !== '' || (s.value?.trim() ?? '') !== '',
  );
}

export function filterSources<T extends { label?: string; url?: string }>(sources: T[]): T[] {
  return sources.filter(
    (s) => (s.label?.trim() ?? '') !== '' || (s.url?.trim() ?? '') !== '',
  );
}

export function resolveListingLoadError(
  error: unknown,
  t: (key: string) => string,
): string {
  const ax = error as { response?: { status?: number }; status?: number; code?: string };
  const status = ax?.response?.status ?? ax?.status;
  if (status === 404) return t('listing.detail.not_found');
  if (status === 403) return t('listing.wizard.load_error_forbidden');
  if (ax?.code === 'ERR_NETWORK' || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return t('listing.wizard.load_error_network');
  }
  return t('listing.wizard.load_error');
}

