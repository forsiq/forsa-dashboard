
import React, { useState } from 'react';
import { Check, ChevronRight, ChevronLeft, AlertCircle, Save } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { AmberButton } from '../AmberButton';

export interface Step {
  id: string | number;
  title: string;
  description?: string;
  content: React.ReactNode;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  allowSkip?: boolean | boolean[]; // Global boolean or specific index
  validateStep?: (step: number) => boolean | Promise<boolean>;
  saveOnStepChange?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  allowSkip = false,
  validateStep,
  saveOnStepChange = false,
  isSubmitting = false,
  className
}) => {
  const [validating, setValidating] = useState(false);

  const handleNext = async () => {
    setValidating(true);
    try {
      let isValid = true;
      if (validateStep) {
        isValid = await validateStep(currentStep);
      }

      if (isValid) {
        if (currentStep < steps.length - 1) {
          onStepChange(currentStep + 1);
        } else {
          onComplete();
        }
      }
    } catch (error) {
      console.error("Step validation failed", error);
    } finally {
      setValidating(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const isSkippable = (index: number) => {
    if (Array.isArray(allowSkip)) return allowSkip[index];
    return allowSkip;
  };

  const handleSkip = () => {
    if (isSkippable(currentStep)) {
      if (currentStep < steps.length - 1) {
        onStepChange(currentStep + 1);
      } else {
        onComplete();
      }
    }
  };

  return (
    <div className={cn("flex flex-col w-full h-full", className)}>
      {/* Progress Header */}
      <div className="relative mb-8 px-4">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-white/10 -z-10 rounded-full" />
        <div 
          className="absolute top-4 left-0 h-0.5 bg-brand -z-10 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} 
        />

        <div className="flex justify-between w-full">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center group">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10",
                    isCompleted ? "bg-brand border-brand text-obsidian-outer" :
                    isActive ? "bg-obsidian-panel border-brand text-brand shadow-[0_0_15px_rgba(255,192,0,0.4)] scale-110" :
                    "bg-obsidian-panel border-white/20 text-zinc-muted"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-xs font-bold">{index + 1}</span>}
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    isActive ? "text-brand" : isCompleted ? "text-zinc-text" : "text-zinc-muted"
                  )}>
                    {step.title}
                  </p>
                  {step.description && isActive && (
                    <p className="text-[9px] font-medium text-zinc-secondary mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-obsidian-panel/50 border border-white/5 rounded-lg p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-xl overflow-y-auto">
        {steps[currentStep].content}
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
        <AmberButton 
          variant="ghost" 
          onClick={handleBack} 
          disabled={currentStep === 0 || isSubmitting || validating}
          className={cn("transition-opacity", currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-100")}
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </AmberButton>

        <div className="flex gap-3">
          {isSkippable(currentStep) && (
             <AmberButton 
               variant="ghost" 
               onClick={handleSkip}
               disabled={isSubmitting || validating}
               className="text-zinc-muted hover:text-zinc-text"
             >
               Skip
             </AmberButton>
          )}

          <AmberButton 
            onClick={handleNext}
            disabled={isSubmitting || validating}
            className={cn(
              "min-w-[120px]",
              currentStep === steps.length - 1 ? "bg-success text-white hover:bg-success/90" : "bg-brand text-obsidian-outer"
            )}
          >
            {isSubmitting || validating ? (
              <span className="flex items-center gap-2">Processing...</span>
            ) : currentStep === steps.length - 1 ? (
              <span className="flex items-center gap-2">Complete <Check className="w-4 h-4" /></span>
            ) : (
              <span className="flex items-center gap-2">
                {saveOnStepChange ? 'Save & Next' : 'Next Step'} <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </AmberButton>
        </div>
      </div>
    </div>
  );
};
