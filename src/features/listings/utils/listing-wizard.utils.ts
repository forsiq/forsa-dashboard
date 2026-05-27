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
  | typeof MOBILE_WIZARD_STEP;

export interface WizardLayout {
  isMobile: boolean;
  step: WizardStepMap;
  totalSteps: number;
  stepIds: readonly WizardStepId[];
  stepLabelKeys: readonly string[];
}

export function getWizardLayout(isMobile: boolean): WizardLayout {
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
): number {
  const layout = getWizardLayout(isMobile);
  if (!queryStep || queryStep < 1) return layout.step.PRODUCT;
  const capped = Math.min(queryStep, layout.totalSteps);
  return Math.max(layout.step.PRODUCT, Math.min(maxStep, capped));
}

export function remapWizardStep(
  currentStep: number,
  fromMobile: boolean,
  toMobile: boolean,
): number {
  if (fromMobile === toMobile) {
    return Math.min(currentStep, getWizardLayout(toMobile).totalSteps);
  }
  const from = getWizardLayout(fromMobile);
  const to = getWizardLayout(toMobile);
  const stepId = from.stepIds[currentStep - 1];
  if (!stepId) return to.step.PRODUCT;
  const targetIndex = to.stepIds.indexOf(stepId);
  return targetIndex >= 0 ? targetIndex + 1 : to.step.PRODUCT;
}
