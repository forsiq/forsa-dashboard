import React from 'react';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import { WIZARD_STEP_IDS } from '../utils/listing-wizard.utils';

interface ListingWizardStepIndicatorProps {
  currentStep: number;
  maxStep?: number;
  minStep?: number;
}

const STEP_LABEL_KEYS = [
  'listing.wizard.step.product',
  'listing.wizard.step.details',
  'listing.wizard.step.media',
  'listing.wizard.step.channel',
  'listing.wizard.step.publish',
] as const;

export function ListingWizardStepIndicator({
  currentStep,
  maxStep = WIZARD_STEP_IDS.length,
  minStep = 1,
}: ListingWizardStepIndicatorProps) {
  const { t, dir } = useLanguage();
  const steps = STEP_LABEL_KEYS.slice(minStep - 1, maxStep);

  return (
    <div className="w-full overflow-x-auto scrollbar-hide pb-2" dir={dir}>
      <div className="flex items-center gap-1 min-w-max px-1">
        {steps.map((key, index) => {
          const stepNum = index + minStep;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;

          return (
            <React.Fragment key={key}>
              {index > 0 && (
                <div
                  className={cn(
                    'h-px w-6 sm:w-10 shrink-0',
                    isDone || isActive ? 'bg-brand/40' : 'bg-white/10',
                  )}
                />
              )}
              <div
                className={cn(
                  'flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg shrink-0 transition-colors',
                  isActive && 'bg-brand/10 border border-brand/30',
                  isDone && !isActive && 'opacity-80',
                  !isActive && !isDone && 'opacity-50',
                )}
              >
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black',
                    isActive && 'bg-brand text-black',
                    isDone && !isActive && 'bg-brand/20 text-brand',
                    !isActive && !isDone && 'bg-white/5 text-zinc-muted',
                  )}
                >
                  {isDone ? '✓' : stepNum}
                </span>
                <span
                  className={cn(
                    'text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap hidden sm:inline',
                    isActive ? 'text-brand' : 'text-zinc-muted',
                  )}
                >
                  {t(key)}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
