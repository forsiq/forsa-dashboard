import React from 'react';
import { useRouter } from 'next/router';
import {
  ChevronLeft,
  Image as ImageIcon,
  AlertCircle,
  X,
  Clock,
  Package,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import { AmberFormSkeleton } from '@core/components/Loading/AmberFormSkeleton';
import { EmptyState } from '@core/components/EmptyState';
import { resolveListingLoadError } from '../utils/listing-wizard.utils';
import { useWizardFormFields } from '../utils/listing-wizard.fields';
import { useListingWizard } from '../hooks/useListingWizard';
import { ListingSpecsEditor } from '../components/ListingSpecsEditor';
import { ListingSourcesEditor } from '../components/ListingSourcesEditor';
import { FlowConceptBanner } from '../components/FlowConceptBanner';
import { ListingWizardStepIndicator } from '../components/ListingWizardStepIndicator';
import { WizardProductStep } from '../components/WizardProductStep';
import { WizardChannelStep } from '../components/WizardChannelStep';
import { WizardAuctionPricingStep } from '../components/WizardAuctionPricingStep';
import { WizardGroupBuyPricingStep } from '../components/WizardGroupBuyPricingStep';
import { WizardPublishReview } from '../components/WizardPublishReview';
import { WizardFooterNav } from '../components/WizardFooterNav';
import { WizardSuccessCard } from '../components/WizardSuccessCard';
import { FormSection } from '@core/components/FormSection';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import type { ListingWizardMode, ListingWizardPageProps } from '../types/listingWizard.types';

export type { ListingWizardMode, ListingWizardPageProps };

function WizardLoadingShell({
  t,
  banner,
}: {
  t: (key: string) => string;
  banner?: React.ReactNode;
}) {
  return (
    <div className="space-y-4 p-6 max-w-[1200px] mx-auto">
      {banner}
      <p className="text-sm text-zinc-muted font-bold">{t('listing.wizard.preparing')}</p>
      <AmberFormSkeleton fields={6} header actions layout="grid" />
    </div>
  );
}

export const ListingWizardPage: React.FC<ListingWizardPageProps> = ({
  mode: modeProp,
  maxStep: maxStepProp,
}) => {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const w = useListingWizard({ mode: modeProp, maxStepProp, t });
  const { essentialFields, advancedFields, basicFields } = useWizardFormFields(t);

  if (!w.isClient || !w.router.isReady) {
    return <WizardLoadingShell t={t} banner={w.importedBanner} />;
  }

  if (w.invalidListingId) {
    return (
      <EmptyState
        icon={Package}
        title={t('listing.wizard.invalid_id')}
        actionLabel={t('listing.form.cancel') || 'Back'}
        onAction={() => w.router.push('/listings')}
      />
    );
  }

  if (w.listingId && w.listingLoading && w.wizardMode !== 'create') {
    return <WizardLoadingShell t={t} banner={w.importedBanner} />;
  }

  if (w.listingLoadError && w.listingId && w.wizardMode !== 'create') {
    return (
      <div className="space-y-4 p-6 max-w-[1200px] mx-auto">
        {w.importedBanner}
        <EmptyState
          icon={AlertCircle}
          title={resolveListingLoadError(w.listingFetchError, t)}
          actionLabel={t('common.retry')}
          onAction={() => void w.refetchListing()}
        />
      </div>
    );
  }

  if (
    (w.wizardMode === 'publish-only' || w.wizardMode === 'edit') &&
    w.listingId &&
    !w.listingLoading &&
    !w.existingListing
  ) {
    return (
      <EmptyState
        icon={Package}
        title={t('listing.detail.not_found') || 'Not Found'}
        actionLabel={t('listing.form.cancel') || 'Back'}
        onAction={() => w.router.push('/listings')}
      />
    );
  }

  const pageTitle =
    w.wizardMode === 'create'
      ? t('listing.wizard.title_create')
      : w.wizardMode === 'publish-only'
        ? t('listing.wizard.title_publish')
        : t('listing.wizard.title_edit');

  return (
    <div className="space-y-4 md:space-y-8 p-3 md:p-6 max-w-[1200px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {w.isPublishFlow && (
        <FlowConceptBanner messageKey="listing.flow.concept_publish" />
      )}

      {w.wizardMode === 'create' && !w.isPublishFlow && (
        <FlowConceptBanner messageKey="listing.flow.concept_catalog" />
      )}

      {w.showImportedBanner && (
        <div className="bg-brand/10 border border-brand/20 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <p className="text-sm font-bold text-zinc-text flex-1">{t('listing.wizard.imported_banner')}</p>
          <button
            type="button"
            onClick={() => w.setShowImportedBanner(false)}
            className="text-zinc-muted hover:text-zinc-text shrink-0"
            aria-label={t('common.close') || 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {w.stepOutOfRange && (
        <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm text-zinc-text font-medium">{t('listing.wizard.invalid_step')}</p>
        </div>
      )}

      {w.wizardMode === 'edit' && w.existingListing && (w.approvalStatus === 'rejected' || w.approvalStatus === 'changes_requested') && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-black text-danger uppercase">
              {w.approvalStatus === 'rejected'
                ? (t('approval.status.rejected') || 'Rejected')
                : (t('approval.status.changes_requested') || 'Changes Requested')}
            </p>
            {(w.existingListing as any).rejectionReason && (
              <p className="text-sm text-zinc-text font-medium">{(w.existingListing as any).rejectionReason}</p>
            )}
            <p className="text-[11px] text-zinc-muted font-bold">
              {t('approval.messages.fix_and_resubmit') || 'Fix the issues below and resubmit for review.'}
            </p>
          </div>
        </div>
      )}

      {w.wizardMode === 'edit' && w.existingListing && w.approvalStatus === 'pending_review' && (
        <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-start gap-3">
          <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-black text-warning uppercase">
              {t('approval.status.pending_review') || 'Pending Review'}
            </p>
            <p className="text-[11px] text-zinc-muted font-bold">
              {t('approval.messages.under_review') || 'This listing is currently under review. You can still edit it.'}
            </p>
          </div>
        </div>
      )}

      {w.submitError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium whitespace-pre-line">{w.submitError}</p>
          <button type="button" onClick={() => w.setSubmitError(null)} className="ml-auto text-danger/60 hover:text-danger">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {w.showSubmitSuccess && w.listingId && (
        <WizardSuccessCard
          listingId={w.listingId}
          isTrustedMerchant={w.isTrustedMerchant}
          isListingApproved={w.isListingApproved}
          isBusy={w.isBusy}
          isSubmitting={w.submitForReviewMutation.isPending}
          t={t}
          onSubmit={w.submitListing}
          onGoToPublishFlow={w.goToPublishFlow}
          onSaveAndExit={w.handleSaveAndExit}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <AmberButton
            variant="secondary"
            className="p-0 w-11 h-11 rounded-xl flex items-center justify-center"
            onClick={() => {
              if (w.currentStep > 1) w.goToStep(w.currentStep - 1);
              else w.router.push(w.listingId ? `/listings/${w.listingId}` : '/listings');
            }}
          >
            <ChevronLeft className={cn('w-5 h-5', isRTL && 'rotate-180')} />
          </AmberButton>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-zinc-text tracking-tighter uppercase leading-none">
              {pageTitle}
            </h1>
            {w.existingListing?.title && (
              <p className="text-sm text-zinc-muted font-bold uppercase mt-1">{w.existingListing.title}</p>
            )}
          </div>
        </div>
      </div>

      <ListingWizardStepIndicator
        currentStep={w.currentStep}
        maxStep={w.maxStep}
        minStep={w.wizardMode === 'publish-only' ? w.fullLayoutStep.CHANNEL : 1}
        stepLabelKeys={w.effectiveStepLabelKeys}
      />

      {w.currentStep === w.step.PRODUCT && (
        <WizardProductStep
          t={t}
          isRTL={isRTL}
          isMobile={w.isMobile}
          catalog={w.catalog}
          setCatalog={w.setCatalog}
          fieldErrors={w.fieldErrors}
          setFieldErrors={w.setFieldErrors}
          essentialFields={essentialFields}
          advancedFields={advancedFields}
          basicFields={basicFields}
          brands={w.brands}
          barcodeFoundListing={w.barcodeFoundListing}
          shouldRenderBarcodeDialog={w.shouldRenderBarcodeDialog}
          closeBarcodeDialog={w.closeBarcodeDialog}
          onViewBarcodeProduct={(id) => w.router.push(`/listings/${id}`)}
          onBarcodeLookup={w.onBarcodeLookup}
          isBarcodeLookupPending={w.isBarcodeLookupPending}
        />
      )}

      {!w.isMerchant && !w.isMobile && w.currentStep === 2 && (
        <div className="space-y-8">
          <ListingSpecsEditor
            specs={w.catalog.specs}
            onChange={(specs) => w.setCatalog((p) => ({ ...p, specs }))}
          />
          <ListingSourcesEditor
            sources={w.catalog.sources}
            onChange={(sources) => w.setCatalog((p) => ({ ...p, sources }))}
          />
        </div>
      )}

      {w.currentStep === w.step.MEDIA && (
        <div className={cn(w.isMobile && 'space-y-6')}>
          <FormSection icon={<ImageIcon className="w-5 h-5" />} iconBgColor="info" title={t('listing.wizard.step.media')}>
            <AmberImageUpload
              value={w.imageUpload.previewUrls}
              onChange={(files) => {
                if (files?.length) w.imageUpload.appendFiles(files);
              }}
              onRemove={(index) => {
                const existingCount =
                  w.imageUpload.previewUrls.length - w.imageUpload.pendingFiles.length;
                if (index < existingCount) {
                  w.setRetainedAttachmentIds((prev) => prev.filter((_, i) => i !== index));
                }
                w.imageUpload.removeAt(index);
              }}
              onReorder={w.handleImageReorder}
              multiple
              sortable
              maxFiles={10}
              disabled={w.isUploading}
              isUploading={w.isUploading}
              uploadProgress={w.uploadProgress}
              uploadError={w.uploadError}
            />
            <p className="text-[11px] text-zinc-muted font-bold uppercase tracking-widest text-center mt-4">
              {t('common.image_upload_hint')}
            </p>
          </FormSection>

          {(w.isMobile || w.isMerchant) && (
            <>
              <button
                type="button"
                onClick={() => w.setShowOptionalDetails((open) => !open)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors',
                  isRTL && 'flex-row-reverse',
                )}
              >
                <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                  {t('listing.wizard.optional_details')}
                </span>
              </button>

              {w.showOptionalDetails && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <ListingSpecsEditor
                    specs={w.catalog.specs}
                    onChange={(specs) => w.setCatalog((p) => ({ ...p, specs }))}
                  />
                  <ListingSourcesEditor
                    sources={w.catalog.sources}
                    onChange={(sources) => w.setCatalog((p) => ({ ...p, sources }))}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {w.currentStep === w.fullLayoutStep.CHANNEL && w.showPublishSteps && (
        <WizardChannelStep
          t={t}
          isRTL={isRTL}
          existingListing={w.existingListing}
          wizardGalleryImages={w.wizardGalleryImages}
          deployChannel={w.deployChannel}
          setDeployChannel={w.setDeployChannel}
          setFieldErrors={w.setFieldErrors}
          onRouterPush={(path) => void w.router.push(path)}
        />
      )}

      {w.currentStep === w.fullLayoutStep.PUBLISH && w.showPublishSteps && w.deployChannel === 'auction' && (
        <WizardAuctionPricingStep
          t={t}
          isRTL={isRTL}
          isMobile={w.isMobile}
          showAdvancedPricing={w.showAdvancedPricing}
          setShowAdvancedPricing={w.setShowAdvancedPricing}
          auctionPricing={w.auctionPricing}
          setAuctionPricing={w.setAuctionPricing}
          fieldErrors={w.fieldErrors}
          setFieldErrors={w.setFieldErrors}
          auctionDurationDays={w.auctionDurationDays}
          auctionUseDurationMode={w.auctionUseDurationMode}
          auctionComputedEndTime={w.auctionComputedEndTime}
          setAuctionDurationDays={w.setAuctionDurationDays}
          setAuctionUseDurationMode={w.setAuctionUseDurationMode}
        />
      )}

      {w.currentStep === w.fullLayoutStep.PUBLISH && w.showPublishSteps && w.deployChannel === 'group_buy' && (
        <WizardGroupBuyPricingStep
          t={t}
          groupBuyPricing={w.groupBuyPricing}
          setGroupBuyPricing={w.setGroupBuyPricing}
          fieldErrors={w.fieldErrors}
          setFieldErrors={w.setFieldErrors}
          groupBuyDurationDays={w.groupBuyDurationDays}
          groupBuyUseDurationMode={w.groupBuyUseDurationMode}
          groupBuyComputedEndTime={w.groupBuyComputedEndTime}
          setGroupBuyDurationDays={w.setGroupBuyDurationDays}
          setGroupBuyUseDurationMode={w.setGroupBuyUseDurationMode}
        />
      )}

      {w.currentStep === w.fullLayoutStep.PUBLISH && w.showPublishSteps && (
        <WizardPublishReview
          t={t}
          dir={dir}
          catalogTitle={w.catalog.title}
          deployChannel={w.deployChannel}
          wizardGalleryImages={w.wizardGalleryImages}
          auctionPricing={w.auctionPricing}
          groupBuyPricing={w.groupBuyPricing}
          auctionUseDurationMode={w.auctionUseDurationMode}
          auctionComputedEndTime={w.auctionComputedEndTime}
          groupBuyUseDurationMode={w.groupBuyUseDurationMode}
          groupBuyComputedEndTime={w.groupBuyComputedEndTime}
        />
      )}

      <WizardFooterNav
        currentStep={w.currentStep}
        maxStep={w.maxStep}
        isBusy={w.isBusy}
        isSubmitting={w.submitForReviewMutation.isPending}
        isRTL={isRTL}
        isMerchant={w.isMerchant}
        isTrustedMerchant={w.isTrustedMerchant}
        isListingApproved={w.isListingApproved}
        showPublishSteps={w.showPublishSteps}
        stepProduct={w.step.PRODUCT}
        stepMedia={w.step.MEDIA}
        stepPublish={w.fullLayoutStep.PUBLISH}
        t={t}
        onBack={() => {
          if (w.currentStep > 1) w.goToStep(w.currentStep - 1);
          else w.router.push(w.listingId ? `/listings/${w.listingId}` : '/listings');
        }}
        onNext={w.handleNext}
        onPublish={w.handlePublish}
        onSaveAndExit={w.handleSaveAndExit}
        onMediaStepAction={w.handleMediaStepAction}
        onSubmit={w.submitListing}
        onGoToPublishFlow={w.goToPublishFlow}
      />
    </div>
  );
};

export default ListingWizardPage;
