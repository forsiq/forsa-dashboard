import {
  ChevronRight,
  Rocket,
  SendHorizonal,
} from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';

interface WizardFooterNavProps {
  currentStep: number;
  maxStep: number;
  isBusy: boolean;
  isSubmitting: boolean;
  isRTL: boolean;
  isMerchant: boolean;
  isTrustedMerchant: boolean;
  isListingApproved: boolean;
  showPublishSteps: boolean;
  stepProduct: number;
  stepMedia: number;
  stepPublish: number;
  t: (key: string) => string;
  onBack: () => void;
  onNext: () => void;
  onPublish: () => void;
  onSaveAndExit: () => void;
  onMediaStepAction: (action: (id: number) => void | Promise<void>) => void;
  onSubmit: (mode: 'review' | 'direct', id: number) => void;
  onGoToPublishFlow: (id: number) => void;
}

export function WizardFooterNav({
  currentStep,
  maxStep,
  isBusy,
  isSubmitting,
  isRTL,
  isMerchant,
  isTrustedMerchant,
  isListingApproved,
  showPublishSteps,
  stepProduct,
  stepMedia,
  stepPublish,
  t,
  onBack,
  onNext,
  onPublish,
  onSaveAndExit,
  onMediaStepAction,
  onSubmit,
  onGoToPublishFlow,
}: WizardFooterNavProps) {
  return (
    <div className="flex justify-between gap-3 pt-4 border-t border-white/5">
      <AmberButton
        variant="outline"
        className="h-11 rounded-xl px-6"
        disabled={currentStep <= 1 || isBusy}
        onClick={onBack}
      >
        {t('listing.wizard.back')}
      </AmberButton>
      {currentStep === stepMedia && isMerchant ? (
        isTrustedMerchant ? (
          <div className="flex flex-wrap gap-3 justify-end">
            <AmberButton
              variant="outline"
              className="h-11 border-border font-bold rounded-xl px-6"
              disabled={isBusy}
              onClick={() => void onSaveAndExit()}
            >
              {isBusy ? (
                <div className="w-4 h-4 border-2 border-zinc-text border-t-transparent rounded-full animate-spin" />
              ) : null}
              {t('listing.wizard.save_and_exit')}
            </AmberButton>
            {isListingApproved ? (
              <AmberButton
                className="h-11 bg-brand text-black font-black rounded-xl px-8 gap-2"
                disabled={isBusy}
                onClick={() => void onMediaStepAction((id) => onGoToPublishFlow(id))}
              >
                <Rocket className="w-4 h-4" />
                {t('listing.wizard.continue_to_publish')}
                <ChevronRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
              </AmberButton>
            ) : (
              <AmberButton
                className="h-11 bg-brand text-black font-black rounded-xl px-8 gap-2"
                disabled={isBusy}
                onClick={() => void onMediaStepAction((id) => onSubmit('direct', id))}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                {t('approval.actions.direct_publish')}
                <ChevronRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
              </AmberButton>
            )}
          </div>
        ) : (
          <AmberButton
            className="h-11 bg-brand text-black font-black rounded-xl px-8 gap-2"
            disabled={isBusy}
            onClick={() => void onMediaStepAction((id) => onSubmit('review', id))}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendHorizonal className="w-4 h-4" />
            )}
            {t('approval.actions.submit')}
            <ChevronRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
          </AmberButton>
        )
      ) : currentStep < stepPublish || !showPublishSteps ? (
        <AmberButton
          className="h-11 bg-brand text-black font-black rounded-xl px-8 gap-2"
          disabled={isBusy}
          onClick={() => void onNext()}
        >
          {isBusy && (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          )}
          <span>
            {currentStep === stepMedia && maxStep === stepMedia
              ? t('listing.form.save')
              : t('listing.wizard.next')}
          </span>
          <ChevronRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
        </AmberButton>
      ) : (
        <AmberButton
          className="h-11 bg-brand text-black font-black rounded-xl px-8 gap-2"
          disabled={isBusy}
          onClick={() => void onPublish()}
        >
          {isBusy ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Rocket className="w-4 h-4" />
          )}
          {t('listing.deploy.deploy')}
        </AmberButton>
      )}
    </div>
  );
}
