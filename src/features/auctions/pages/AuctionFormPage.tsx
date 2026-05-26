import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { X, AlertCircle } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberButton } from '@core/components/AmberButton';
import { AmberFormSkeleton } from '@core/components/Loading/AmberFormSkeleton';
import { usePendingImageFiles } from '@core/hooks/usePendingImageFiles';
import { useFormUX } from '@core/hooks/useFormUX';
import { useGetAuction } from '../api';

import { useList as useInventoryList } from '../../../services/inventory/hooks';
import { useList as useCategories } from '../../../services/categories/hooks';
import { getLocalizedName } from '../../../services/categories/types';

// Hooks
import { useAuctionFormState } from '../hooks/useAuctionFormState';
import { useAuctionFormSubmit } from '../hooks/useAuctionFormSubmit';
import { useAuctionFormSync } from '../hooks/useAuctionFormSync';
import { useAuctionDurationCalc } from '../hooks/useAuctionDurationCalc';

// Sub-components
import { AuctionFormHeader } from '../components/AuctionFormHeader';
import { AuctionCoreFields } from '../components/AuctionCoreFields';
import { AuctionPricingFields } from '../components/AuctionPricingFields';
import { AuctionSpecsEditor } from '../components/AuctionSpecsEditor';
import { AuctionSourcesEditor } from '../components/AuctionSourcesEditor';
import { AuctionImageSection } from '../components/AuctionImageSection';
import { AuctionTemporalSection } from '../components/AuctionTemporalSection';

const HISTORY_KEY = 'history_auction';

/**
 * AuctionFormPage - Universal Creation and Modification Interface
 */
export const AuctionFormPage: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const isClone = router.pathname.includes('/clone/');
  const isEdit = !!id && !isClone;
  const cloneSourceId = isClone ? Number(id) : undefined;
  const isRTL = dir === 'rtl';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const auctionId = Number(id);
  const { data: existingAuction, isLoading: auctionLoading } = useGetAuction(isClone ? cloneSourceId! : auctionId);
  const { data: inventoryData } = useInventoryList();
  const { data: categoriesData } = useCategories({ limit: 100 });
  const inventoryItems = (inventoryData as any)?.items || [];
  const categoryOptions = (categoriesData as any)?.categories?.map((c: any) => ({
    label: getLocalizedName(c, language) || c.name || c.slug,
    value: String(c.id),
  })) || [];

  // Custom hooks
  const { formData, setFormData, errors, setErrors, handleChange, initialFormData } = useAuctionFormState();
  const { durationDays, setDurationDays, useDurationMode, setUseDurationMode, computedEndTime } = useAuctionDurationCalc(formData.startTime);
  const imageUpload = usePendingImageFiles();

  const { isDirty, markClean } = useFormUX({
    values: formData,
    initialValues: initialFormData,
    isSubmitting: false, // updated below via submit hook
    storageKey: isEdit ? `auction-draft-${auctionId}` : 'auction-draft-new',
    historyKey: HISTORY_KEY,
    historyFields: ['categoryId', 'bidIncrement', 'durationDays', 'startPrice'],
  });

  const { retainedAttachmentIds, setRetainedAttachmentIds } = useAuctionFormSync({
    existingAuction,
    isEdit,
    isClone,
    setFormData,
    setDurationDays,
    resetFromServer: imageUpload.resetFromServer,
  });

  const {
    submitError,
    setSubmitError,
    handleSubmit,
    isSubmitting,
    isUploading,
    uploadProgress,
    uploadError,
    createMutation,
    updateMutation,
  } = useAuctionFormSubmit({
    formData,
    setErrors,
    useDurationMode,
    computedEndTime,
    imageUpload,
    retainedAttachmentIds,
    markClean,
    isEdit,
    auctionId,
    t,
  });

  const mode = isClone ? 'clone' : isEdit ? 'edit' : 'create';

  if (!isClient) return null;

  if ((isEdit || isClone) && (auctionLoading || !router.isReady)) {
    return <AmberFormSkeleton fields={8} header actions layout="grid" />;
  }

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={dir}>
      {/* Submission Error Banner */}
      {submitError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium whitespace-pre-line">{submitError}</p>
          <button onClick={() => setSubmitError(null)} className="ml-auto text-danger/60 hover:text-danger">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Navigation Header */}
      <AuctionFormHeader
        mode={mode}
        id={id}
        isSubmitting={isSubmitting}
        isUploading={isUploading}
        onSubmit={handleSubmit}
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Primary Data Cluster */}
        <div className="lg:col-span-2 space-y-4 md:space-y-8">
          <AuctionCoreFields
            formData={formData}
            errors={errors}
            onChange={(field, value) => handleChange(field, value, inventoryItems)}
            inventoryItems={inventoryItems}
            categoryOptions={categoryOptions}
          />

          <AuctionPricingFields
            startPrice={formData.startPrice}
            bidIncrement={formData.bidIncrement}
            reservePrice={formData.reservePrice}
            errors={errors}
            onChange={handleChange}
          />

          <AuctionSpecsEditor
            specs={formData.specs || []}
            onChange={(specs) => handleChange('specs', specs)}
          />

          <AuctionSourcesEditor
            sources={formData.sources || []}
            onChange={(sources) => handleChange('sources', sources)}
          />
        </div>

        {/* Temporal & Visual Logistics */}
        <div className="space-y-4 md:space-y-8">
          <AuctionImageSection
            imageUpload={imageUpload}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadError={uploadError}
            onRemoveExisting={(index) => {
              const existingCount = imageUpload.previewUrls.length - imageUpload.pendingFiles.length;
              if (index < existingCount) {
                setRetainedAttachmentIds((prev) => prev.filter((_, i) => i !== index));
              }
              imageUpload.removeAt(index);
            }}
          />

          <AuctionTemporalSection
            startTime={formData.startTime}
            endTime={formData.endTime}
            errors={errors}
            durationDays={durationDays}
            useDurationMode={useDurationMode}
            computedEndTime={computedEndTime}
            onStartTimeChange={(val) => handleChange('startTime', val)}
            onEndTimeChange={(val) => handleChange('endTime', val)}
            onDurationDaysChange={(days) => {
              setDurationDays(days);
              setFormData(prev => ({ ...prev, durationDays: days }));
            }}
            onUseDurationModeChange={setUseDurationMode}
          />

          {/* Deployment Control Surface */}
          <div className="space-y-3">
            <AmberButton
              className="w-full h-12 md:h-14 bg-brand hover:bg-brand text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 transition-all text-sm gap-3"
              disabled={updateMutation.isPending || createMutation.isPending || isUploading}
              onClick={handleSubmit}
            >
              {(updateMutation.isPending || createMutation.isPending || isUploading) && (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              )}
              {isClone ? (t('auction.form.action.clone') || 'Clone Auction') : isEdit ? t('auction.form.authorize_sync') : t('auction.form.execute_deployment')}
            </AmberButton>
            <AmberButton
              variant="secondary"
              className="w-full h-12 bg-obsidian-card font-black uppercase tracking-widest rounded-xl border border-white/5 active:scale-95 transition-all"
              onClick={() => router.push('/auctions')}
            >
              {t('auction.form.cancel')}
            </AmberButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AuctionFormPage;
