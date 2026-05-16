/** Grouped wizard steps (important fields per screen). */
export const WIZARD_STEP_IDS = [
  'product',
  'details',
  'media',
  'channel',
  'publish',
] as const;

export type WizardStepId = (typeof WIZARD_STEP_IDS)[number];

export const WIZARD_STEP = {
  PRODUCT: 1,
  DETAILS: 2,
  MEDIA: 3,
  CHANNEL: 4,
  PUBLISH: 5,
} as const;

export const WIZARD_TOTAL_STEPS = WIZARD_STEP_IDS.length;

export function wizardStepToNumber(step: WizardStepId): number {
  return WIZARD_STEP_IDS.indexOf(step) + 1;
}

export function numberToWizardStep(n: number): WizardStepId {
  const idx = Math.max(0, Math.min(WIZARD_STEP_IDS.length - 1, n - 1));
  return WIZARD_STEP_IDS[idx];
}
