import {
  CheckCircle,
  Rocket,
  SendHorizonal,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { AmberButton } from '@core/components/AmberButton';

interface WizardSuccessCardProps {
  listingId: number;
  isTrustedMerchant: boolean;
  isListingApproved: boolean;
  isBusy: boolean;
  isSubmitting: boolean;
  t: (key: string) => string;
  onSubmit: (mode: 'review' | 'direct', id: number) => void;
  onGoToPublishFlow: (id: number) => void;
  onSaveAndExit: () => void;
}

export function WizardSuccessCard({
  listingId,
  isTrustedMerchant,
  isListingApproved,
  isBusy,
  isSubmitting,
  t,
  onSubmit,
  onGoToPublishFlow,
  onSaveAndExit,
}: WizardSuccessCardProps) {
  const router = useRouter();

  return (
    <div className="bg-success/10 border border-success/20 p-6 rounded-2xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-success" />
        </div>
        <div>
          <p className="text-lg font-black text-zinc-text uppercase">
            {t('listing.wizard.saved') || 'Product Saved'}
          </p>
          <p className="text-sm text-zinc-muted">
            {isTrustedMerchant
              ? isListingApproved
                ? t('listing.wizard.already_approved_prompt')
                : t('listing.wizard.trusted_submit_prompt')
              : t('listing.wizard.submit_prompt')}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {isTrustedMerchant ? (
          <>
            {isListingApproved ? (
              <AmberButton
                className="h-11 bg-brand text-black font-black rounded-xl px-6 gap-2 active:scale-95 transition-all"
                disabled={isBusy}
                onClick={() => onGoToPublishFlow(listingId)}
              >
                <Rocket className="w-4 h-4" />
                {t('listing.wizard.continue_to_publish')}
              </AmberButton>
            ) : (
              <AmberButton
                className="h-11 bg-brand text-black font-black rounded-xl px-6 gap-2 active:scale-95 transition-all"
                disabled={isSubmitting}
                onClick={() => onSubmit('direct', listingId)}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                {t('approval.actions.direct_publish')}
              </AmberButton>
            )}
            <AmberButton
              variant="outline"
              className="h-11 border-border font-bold rounded-xl px-6 active:scale-95 transition-all"
              disabled={isBusy}
              onClick={() => void onSaveAndExit()}
            >
              {t('listing.wizard.save_and_exit')}
            </AmberButton>
          </>
        ) : (
          <AmberButton
            className="h-11 bg-brand text-black font-black rounded-xl px-6 gap-2 active:scale-95 transition-all"
            disabled={isSubmitting}
            onClick={() => onSubmit('review', listingId)}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendHorizonal className="w-4 h-4" />
            )}
            {t('approval.actions.submit')}
          </AmberButton>
        )}
        {!isTrustedMerchant && (
          <AmberButton
            variant="outline"
            className="h-11 border-border font-bold rounded-xl px-6 active:scale-95 transition-all"
            onClick={() => router.push(`/listings/${listingId}`)}
          >
            {t('listing.form.save') || 'Save Draft'}
          </AmberButton>
        )}
      </div>
    </div>
  );
}
