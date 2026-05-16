/** Default active window when publishing without schedule UI. */
export const DEFAULT_DEPLOY_DURATION_DAYS = 7;

export function buildImmediateDeployTimes(durationDays = DEFAULT_DEPLOY_DURATION_DAYS): {
  startTime: string;
  endTime: string;
} {
  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() + 1);
  const endTime = new Date(startTime);
  endTime.setDate(endTime.getDate() + durationDays);
  return {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  };
}

export const WIZARD_STEP_IDS = [
  'basic',
  'description',
  'specs',
  'sources',
  'media',
  'channel',
  'pricing',
  'review',
] as const;

export type WizardStepId = (typeof WIZARD_STEP_IDS)[number];

export function wizardStepToNumber(step: WizardStepId): number {
  return WIZARD_STEP_IDS.indexOf(step) + 1;
}

export function numberToWizardStep(n: number): WizardStepId {
  const idx = Math.max(0, Math.min(WIZARD_STEP_IDS.length - 1, n - 1));
  return WIZARD_STEP_IDS[idx];
}
