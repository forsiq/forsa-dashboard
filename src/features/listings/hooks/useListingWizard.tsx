import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@core/hooks/useIsMobile';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import { useIsClient } from '@core/hooks/useIsClient';
import { useFileUpload } from '@core/hooks/useFileUpload';
import { usePendingImageFiles } from '@core/hooks/usePendingImageFiles';
import { useAttachmentUrls } from '@core/hooks/useAttachmentUrls';
import { useOverlayPortal } from '@core/hooks/useOverlayPortal';
import { useMapApiValidationError } from '@core/hooks/useMapApiValidationError';
import { useMapApiValidationFieldErrors } from '@core/hooks/useMapApiValidationFieldErrors';
import { useFormUX } from '@core/hooks/useFormUX';
import { zodIssuesToFieldMap } from '@core/validation/zodIssuesToFieldMap';
import {
  parseBidIncrement,
  parseOptionalListingPrice,
  parseRequiredListingPrice,
} from '@core/utils/listingDeployPrices';
import type {
  ListingSpec,
  ListingSource,
  CreateListingInput,
  UpdateListingInput,
  ProductListing,
} from '../../../types/services/listings.types';
import {
  useCreateListing,
  useUpdateListing,
  useGetListing,
  useDeployAsAuction,
  useDeployAsGroupBuy,
  useSubmitListingForReview,
  isListingSubmitIdempotentError,
  useLookupByBarcode,
  listingKeys,
} from '../api/listing-hooks';
import { useBrands } from './useBrands';
import {
  getWizardLayout,
  normalizeWizardStepFromQuery,
  remapWizardStep,
  filterSpecs,
  filterSources,
  resolveListingLoadError,
  DESKTOP_WIZARD_STEP,
  MOBILE_WIZARD_STEP,
} from '../utils/listing-wizard.utils';
import {
  createWizardBasicStepSchema,
  createWizardDescriptionStepSchema,
} from '../validation/listing-wizard.schemas';
import {
  createDeployAuctionClientSchema,
  createDeployGroupBuyClientSchema,
} from '../validation/deployListingSchemas';
import { useAuctionDurationCalc } from '../../auctions/hooks/useAuctionDurationCalc';
import { getDefaultAuctionSchedule } from '../../auctions/utils/defaultAuctionSchedule';
import {
  buildUrlToAttachmentIdMap,
  getListingAttachmentIds,
  lookupAttachmentIdForPreviewUrl,
  reorderRetainedAttachmentIds,
  resolveListingMediaSave,
} from '../utils/listing-media';
import { buildListingGalleryImages } from '../utils/listing-gallery';
import type { ListingWizardMode } from '../types/listingWizard.types';

export type DeployChannel = 'auction' | 'group_buy' | null;

export interface ListingWizardState {
  catalog: {
    title: string;
    description: string;
    categoryId: number | undefined;
    brand: string;
    model: string;
    condition: string;
    authenticity: string;
    sku: string;
    barcode: string;
    specs: ListingSpec[];
    sources: ListingSource[];
  };
  setCatalog: React.Dispatch<React.SetStateAction<ListingWizardState['catalog']>>;
  deployChannel: DeployChannel;
  setDeployChannel: React.Dispatch<React.SetStateAction<DeployChannel>>;
  auctionPricing: {
    startPrice: number;
    originalPrice: string;
    bidIncrement: number;
    startTime: string;
    endTime: string;
    durationDays: number;
  };
  setAuctionPricing: React.Dispatch<React.SetStateAction<ListingWizardState['auctionPricing']>>;
  groupBuyPricing: {
    originalPrice: number;
    dealPrice: number;
    minParticipants: number;
    maxParticipants: number;
    startTime: string;
    endTime: string;
    durationDays: number;
  };
  setGroupBuyPricing: React.Dispatch<React.SetStateAction<ListingWizardState['groupBuyPricing']>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  listingId: number | undefined;
  setListingId: React.Dispatch<React.SetStateAction<number | undefined>>;
  submitError: string | null;
  setSubmitError: React.Dispatch<React.SetStateAction<string | null>>;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  showMoreDetails: boolean;
  setShowMoreDetails: React.Dispatch<React.SetStateAction<boolean>>;
  showOptionalDetails: boolean;
  setShowOptionalDetails: React.Dispatch<React.SetStateAction<boolean>>;
  showAdvancedPricing: boolean;
  setShowAdvancedPricing: React.Dispatch<React.SetStateAction<boolean>>;
  showSubmitSuccess: boolean;
  setShowSubmitSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  showImportedBanner: boolean;
  setShowImportedBanner: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface UseListingWizardProps {
  mode: ListingWizardMode | undefined;
  maxStepProp: number | undefined;
  t: (key: string) => string;
}

export function useListingWizard({ mode, maxStepProp, t }: UseListingWizardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mapApiError = useMapApiValidationError();
  const mapApiFieldErrors = useMapApiValidationFieldErrors();
  const isClient = useIsClient();

  const routeId = router.query.id ? Number(router.query.id) : undefined;
  const queryStep = router.query.step ? Number(router.query.step) : undefined;
  const queryType = router.query.type as string | undefined;

  const wizardMode: ListingWizardMode =
    mode ??
    (router.pathname.includes('/publish')
      ? 'publish-only'
      : routeId
        ? 'edit'
        : 'create');

  const isPublishFlow = wizardMode === 'publish-only';

  const { isMerchant, isTrustedMerchant, isAdmin } = useDashboardRole();
  const useMerchantWizardLayout = isMerchant && !isPublishFlow;

  const { isMobile } = useIsMobile();
  const wizardLayout = useMemo(
    () => getWizardLayout(isMobile, { merchant: useMerchantWizardLayout }),
    [isMobile, useMerchantWizardLayout],
  );
  const step = wizardLayout.step;
  const fullLayoutStep = useMemo(
    () => (isMobile ? MOBILE_WIZARD_STEP : DESKTOP_WIZARD_STEP),
    [isMobile],
  );
  const prevIsMobileRef = useRef<boolean | null>(null);

  const maxStep = useMerchantWizardLayout
    ? wizardLayout.totalSteps
    : maxStepProp ?? (wizardMode === 'edit' ? step.MEDIA : wizardLayout.totalSteps);

  const initialStep = useMemo(() => {
    if (queryStep) {
      const normalized = normalizeWizardStepFromQuery(queryStep, maxStep, isMobile, {
        merchant: useMerchantWizardLayout,
      });
      if (normalized >= 1 && normalized <= maxStep) return normalized;
    }
    if (wizardMode === 'publish-only') return fullLayoutStep.CHANNEL;
    return step.PRODUCT;
  }, [queryStep, wizardMode, maxStep, isMobile, useMerchantWizardLayout, fullLayoutStep.CHANNEL, step.PRODUCT]);

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [listingId, setListingId] = useState<number | undefined>(routeId);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);

  const [catalog, setCatalog] = useState({
    title: '',
    description: '',
    categoryId: undefined as number | undefined,
    brand: '',
    model: '',
    condition: '',
    authenticity: '',
    sku: '',
    barcode: '',
    specs: [] as ListingSpec[],
    sources: [] as ListingSource[],
  });

  const [deployChannel, setDeployChannel] = useState<DeployChannel>(() => {
    if (queryType === 'group-buy') return 'group_buy';
    if (queryType === 'auction') return 'auction';
    return null;
  });

  const [auctionPricing, setAuctionPricing] = useState(() => {
    const schedule = getDefaultAuctionSchedule();
    return {
      startPrice: 0,
      originalPrice: '',
      bidIncrement: 5000,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      durationDays: schedule.durationDays,
    };
  });

  const {
    durationDays: auctionDurationDays,
    setDurationDays: setAuctionDurationDays,
    useDurationMode: auctionUseDurationMode,
    setUseDurationMode: setAuctionUseDurationMode,
    computedEndTime: auctionComputedEndTime,
  } = useAuctionDurationCalc(auctionPricing.startTime);

  const [groupBuyPricing, setGroupBuyPricing] = useState(() => {
    const schedule = getDefaultAuctionSchedule();
    return {
      originalPrice: 0,
      dealPrice: 0,
      minParticipants: 2,
      maxParticipants: 100,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      durationDays: schedule.durationDays,
    };
  });

  const {
    durationDays: groupBuyDurationDays,
    setDurationDays: setGroupBuyDurationDays,
    useDurationMode: groupBuyUseDurationMode,
    setUseDurationMode: setGroupBuyUseDurationMode,
    computedEndTime: groupBuyComputedEndTime,
  } = useAuctionDurationCalc(groupBuyPricing.startTime);

  const imageUpload = usePendingImageFiles();
  const { upload, isUploading, progress: uploadProgress, error: uploadError } =
    useFileUpload();
  const [retainedAttachmentIds, setRetainedAttachmentIds] = useState<number[]>([]);
  const urlToAttachmentIdRef = useRef<Map<string, number>>(new Map());
  const listingMediaSyncedIdRef = useRef<number | null>(null);

  const {
    data: existingListing,
    isLoading: listingLoading,
    isError: listingLoadError,
    error: listingFetchError,
    refetch: refetchListing,
  } = useGetListing(listingId!, !!listingId && wizardMode !== 'create');
  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();
  const deployAuctionMutation = useDeployAsAuction();
  const deployGroupBuyMutation = useDeployAsGroupBuy();
  const submitForReviewMutation = useSubmitListingForReview();

  const lookupByBarcodeMutation = useLookupByBarcode();
  const { data: brands = [] } = useBrands();
  const [barcodeFoundListing, setBarcodeFoundListing] = useState<ProductListing | null>(null);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const closeBarcodeDialog = useCallback(() => {
    setShowBarcodeDialog(false);
    setBarcodeFoundListing(null);
  }, []);
  const barcodeDialogOpen = showBarcodeDialog && !!barcodeFoundListing;
  const { shouldRender: shouldRenderBarcodeDialog } = useOverlayPortal(
    barcodeDialogOpen,
    closeBarcodeDialog,
  );

  const listingAttachmentIds = useMemo(
    () => (existingListing ? getListingAttachmentIds(existingListing) : []),
    [existingListing],
  );
  const { data: listingAttachmentUrlMap, isPending: listingAttachmentsLoading } =
    useAttachmentUrls(listingAttachmentIds.length > 0 ? listingAttachmentIds : []);

  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const [showImportedBanner, setShowImportedBanner] = useState(false);

  const importedFromAmazon = router.query.imported === '1';

  const invalidListingId =
    wizardMode === 'edit' &&
    router.isReady &&
    router.query.id != null &&
    (routeId == null || !Number.isFinite(routeId) || routeId <= 0);

  const stepOutOfRange = useMemo(() => {
    if (queryStep == null || Number.isNaN(queryStep)) return false;
    return queryStep < 1 || queryStep > maxStep;
  }, [queryStep, maxStep]);

  const importedBanner = (importedFromAmazon || showImportedBanner) ? (
    <div className="bg-brand/10 border border-brand/20 p-4 rounded-xl flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
      <p className="text-sm font-bold text-zinc-text flex-1">
        {importedFromAmazon
          ? t('amazon.import_redirecting')
          : t('listing.wizard.imported_banner')}
      </p>
    </div>
  ) : null;

  // --- Effects ---

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (listingLoadError && listingFetchError) {
      console.warn('[ListingWizardPage] listing fetch failed', {
        listingId,
        wizardMode,
        error: listingFetchError,
      });
    }
  }, [listingLoadError, listingFetchError, listingId, wizardMode]);

  useEffect(() => {
    if (!router.isReady || wizardMode !== 'edit') return;
    if (router.query.imported === '1') {
      setShowImportedBanner(true);
      const { imported: _removed, ...rest } = router.query;
      router.replace(
        { pathname: router.pathname, query: rest },
        undefined,
        { shallow: true },
      );
    }
  }, [router.isReady, router.query.imported, wizardMode, router.pathname, router]);

  useEffect(() => {
    if (stepOutOfRange && process.env.NODE_ENV === 'development') {
      console.warn('[ListingWizardPage] wizard step out of range', {
        queryStep,
        maxStep,
        currentStep,
      });
    }
  }, [stepOutOfRange, queryStep, maxStep, currentStep]);

  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (prevIsMobileRef.current === null) {
      prevIsMobileRef.current = isMobile;
      return;
    }
    if (prevIsMobileRef.current === isMobile) return;
    setCurrentStep((prev) => {
      const remapped = remapWizardStep(prev, prevIsMobileRef.current!, isMobile, {
        merchant: useMerchantWizardLayout,
      });
      return Math.max(step.PRODUCT, Math.min(maxStep, remapped));
    });
    prevIsMobileRef.current = isMobile;
  }, [isMobile, maxStep, step.PRODUCT, useMerchantWizardLayout]);

  useEffect(() => {
    if (!router.isReady || !isMerchant || wizardMode !== 'create') return;
    const overStep = queryStep != null && queryStep > maxStep;
    const hasDeployType = queryType === 'auction' || queryType === 'group-buy';
    if (!overStep && !hasDeployType) return;
    router.replace(
      { pathname: '/listings/new', query: { step: String(Math.min(queryStep ?? maxStep, maxStep)) } },
      undefined,
      { shallow: true },
    );
  }, [router.isReady, isMerchant, wizardMode, queryStep, queryType, maxStep, router]);

  useEffect(() => {
    if (existingListing) {
      setCatalog({
        title: existingListing.title || '',
        description: existingListing.description || '',
        categoryId: existingListing.categoryId,
        brand: existingListing.brand || '',
        model: existingListing.model || '',
        condition: existingListing.condition || '',
        authenticity: existingListing.authenticity || '',
        sku: existingListing.sku || '',
        barcode: (existingListing as any).barcode || '',
        specs: existingListing.specs || [],
        sources: existingListing.sources || [],
      });
      const hasAdvanced =
        !!existingListing.brand ||
        !!existingListing.model ||
        !!existingListing.condition ||
        !!existingListing.authenticity ||
        !!existingListing.sku;
      if (hasAdvanced && isMobile) setShowMoreDetails(true);
      if (
        isMobile &&
        ((existingListing.specs?.length ?? 0) > 0 || (existingListing.sources?.length ?? 0) > 0)
      ) {
        setShowOptionalDetails(true);
      }
    }
  }, [existingListing, isMobile]);

  useEffect(() => {
    if (!existingListing) return;
    if (imageUpload.pendingFiles.length > 0) return;

    const ids = getListingAttachmentIds(existingListing);
    const direct = buildListingGalleryImages(existingListing, listingAttachmentUrlMap);
    if (ids.length > 0 && listingAttachmentsLoading && direct.length === 0) return;

    const previewUrls = direct.length > 0
      ? direct
      : imageUpload.previewUrls.length > 0
        ? imageUpload.previewUrls
        : [];

    if (previewUrls.length === 0) {
      if (ids.length > 0 && listingAttachmentsLoading) return;
      if (listingMediaSyncedIdRef.current === existingListing.id) return;
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ListingWizardPage] no preview URLs resolved', {
          listingId: existingListing.id,
          direct,
          attachmentIds: ids,
          batchResolved: listingAttachmentUrlMap
            ? Object.fromEntries(listingAttachmentUrlMap)
            : undefined,
          raw: {
            imageUrl: existingListing.imageUrl,
            images: existingListing.images,
            attachmentIds: existingListing.attachmentIds,
          },
        });
      }
      return;
    }

    if (
      listingMediaSyncedIdRef.current === existingListing.id &&
      imageUpload.previewUrls.length === previewUrls.length &&
      imageUpload.previewUrls.every((url, i) => url === previewUrls[i])
    ) {
      return;
    }

    imageUpload.resetFromServer(previewUrls);
    const urlMap = buildUrlToAttachmentIdMap(ids, listingAttachmentUrlMap, previewUrls);
    urlToAttachmentIdRef.current = urlMap;
    const alignedIds: number[] = [];
    for (let i = 0; i < previewUrls.length; i++) {
      const mapped = lookupAttachmentIdForPreviewUrl(previewUrls[i], urlMap);
      const fallback = ids[i];
      const id = mapped ?? fallback;
      if (id && id > 0) alignedIds.push(id);
    }
    setRetainedAttachmentIds(alignedIds.length > 0 ? alignedIds : ids);
    listingMediaSyncedIdRef.current = existingListing.id;
  }, [
    existingListing,
    listingAttachmentUrlMap,
    listingAttachmentsLoading,
    imageUpload.pendingFiles.length,
    imageUpload.previewUrls,
    imageUpload.resetFromServer,
  ]);

  // --- Callbacks ---

  const syncStepUrl = useCallback(
    (nextStep: number) => {
      if (!router.isReady) return;
      const base =
        wizardMode === 'publish-only' && listingId
          ? `/listings/${listingId}/publish`
          : wizardMode === 'edit' && listingId
            ? `/listings/${listingId}/edit`
            : '/listings/new';
      const query: Record<string, string> = { step: String(nextStep) };
      if (!useMerchantWizardLayout) {
        if (deployChannel === 'auction') query.type = 'auction';
        if (deployChannel === 'group_buy') query.type = 'group-buy';
      }
      router.replace({ pathname: base, query }, undefined, { shallow: true });
    },
    [router, wizardMode, listingId, deployChannel, useMerchantWizardLayout],
  );

  const goToStep = useCallback(
    (nextStep: number) => {
      const clamped = Math.max(1, Math.min(maxStep, nextStep));
      setCurrentStep(clamped);
      syncStepUrl(clamped);
    },
    [maxStep, syncStepUrl],
  );

  const buildCatalogPayload = useCallback((): CreateListingInput => ({
    title: (catalog.title ?? '').trim(),
    description: catalog.description,
    categoryId: catalog.categoryId,
    brand: catalog.brand || undefined,
    model: catalog.model || undefined,
    condition: catalog.condition || undefined,
    authenticity: catalog.authenticity || undefined,
    sku: catalog.sku || undefined,
    barcode: catalog.barcode || undefined,
    specs: filterSpecs(catalog.specs),
    sources: filterSources(catalog.sources),
  }), [catalog]);

  const saveCatalog = useCallback(async (): Promise<number> => {
    const payload = buildCatalogPayload();
    if (listingId) {
      const updated = await updateMutation.mutateAsync({ id: listingId, data: payload });
      if (updated) queryClient.setQueryData(listingKeys.detail(listingId), updated);
      return listingId;
    }
    const created = await createMutation.mutateAsync(payload);
    setListingId(created.id);
    if (created?.id) queryClient.setQueryData(listingKeys.detail(created.id), created);
    return created.id;
  }, [buildCatalogPayload, listingId, updateMutation, createMutation, queryClient]);

  const saveMedia = useCallback(async (id: number) => {
    const { previewUrls, pendingFiles } = imageUpload;
    if (previewUrls.length === 0) return;

    const { attachmentIds, externalUrlsForServerTransfer, hasPendingUploads } =
      await resolveListingMediaSave({
        previewUrls,
        pendingFiles,
        urlToAttachmentId: urlToAttachmentIdRef.current,
        uploadFile: (file) => upload(file),
        retainedAttachmentIds,
      });

    const originalIds = existingListing ? getListingAttachmentIds(existingListing) : [];
    const orderChanged =
      retainedAttachmentIds.length > 0 &&
      JSON.stringify(retainedAttachmentIds) !== JSON.stringify(originalIds);

    const idsToSave =
      attachmentIds.length > 0
        ? attachmentIds
        : orderChanged
          ? retainedAttachmentIds
          : [];

    const persistableUrls = previewUrls.filter((url) => !url.startsWith('blob:'));

    if (
      idsToSave.length === 0 &&
      externalUrlsForServerTransfer.length === 0 &&
      persistableUrls.length === 0
    ) {
      if (pendingFiles.length > 0) {
        throw new Error(
          uploadError || t('common.upload_failed') || 'Image upload failed. Please try again.',
        );
      }
      return;
    }

    const data: UpdateListingInput = {};
    if (idsToSave.length > 0) {
      data.mainAttachmentId = idsToSave[0];
      data.attachmentIds = idsToSave;
    }
    if (
      externalUrlsForServerTransfer.length > 0 ||
      (idsToSave.length === 0 && persistableUrls.length > 0)
    ) {
      data.images = persistableUrls;
      if (!data.mainAttachmentId) {
        data.imageUrl = persistableUrls[0];
      }
    }

    const updated = await updateMutation.mutateAsync({ id, data });
    if (updated) queryClient.setQueryData(listingKeys.detail(id), updated);
    const savedIds = getListingAttachmentIds(updated);
    if (savedIds.length > 0) {
      setRetainedAttachmentIds(savedIds);
      const gallery = buildListingGalleryImages(updated, listingAttachmentUrlMap);
      urlToAttachmentIdRef.current = buildUrlToAttachmentIdMap(
        savedIds,
        listingAttachmentUrlMap,
        gallery.length > 0 ? gallery : previewUrls,
      );
    }
    if (hasPendingUploads) {
      const gallery = buildListingGalleryImages(updated, listingAttachmentUrlMap);
      imageUpload.resetFromServer(gallery.length > 0 ? gallery : previewUrls);
    }
  }, [imageUpload, upload, retainedAttachmentIds, existingListing, uploadError, t, updateMutation, queryClient, listingAttachmentUrlMap]);

  const persistCatalogAndMedia = useCallback(async (): Promise<number> => {
    let id = listingId;
    if (isMerchant || isMobile) {
      id = await saveCatalog();
      setListingId(id);
    }
    if (!id) {
      throw new Error(t('common.error_occurred') || 'Error');
    }
    await saveMedia(id);
    return id;
  }, [listingId, isMerchant, isMobile, saveCatalog, t, saveMedia]);

  const handleImageReorder = useCallback(
    (newOrder: string[]) => {
      const existingCount =
        imageUpload.previewUrls.length - imageUpload.pendingFiles.length;
      const reorderedIds = reorderRetainedAttachmentIds(
        newOrder.slice(0, existingCount),
        imageUpload.previewUrls,
        retainedAttachmentIds,
        urlToAttachmentIdRef.current,
      );
      if (reorderedIds.length > 0) {
        setRetainedAttachmentIds(reorderedIds);
      }
      imageUpload.reorder(newOrder);
    },
    [imageUpload, retainedAttachmentIds],
  );

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    isUploading ||
    deployAuctionMutation.isPending ||
    deployGroupBuyMutation.isPending ||
    submitForReviewMutation.isPending;

  const approvalStatus = existingListing?.approvalStatus ?? 'draft';
  const isListingApproved = approvalStatus === 'approved';

  const goToPublishFlow = useCallback(
    (id: number) => {
      setShowSubmitSuccess(false);
      router.push(`/listings/${id}/publish`);
    },
    [router],
  );

  const submitListing = useCallback(
    (submitMode: 'review' | 'direct', id: number) => {
      submitForReviewMutation.mutate(
        { id, mode: submitMode },
        {
          onSuccess: () => {
            setShowSubmitSuccess(false);
            router.push(submitMode === 'direct' ? `/listings/${id}/publish` : `/listings/${id}`);
          },
          onError: (error: unknown) => {
            const detail = mapApiError(error) || (error instanceof Error ? error.message : '');
            if (isListingSubmitIdempotentError(detail, submitMode)) {
              setShowSubmitSuccess(false);
              router.push(submitMode === 'direct' ? `/listings/${id}/publish` : `/listings/${id}`);
            }
          },
        },
      );
    },
    [submitForReviewMutation, router, mapApiError],
  );

  const handleSaveAndExit = useCallback(async () => {
    setSubmitError(null);
    setFieldErrors({});
    try {
      const id = await persistCatalogAndMedia();
      router.push(`/listings/${id}`);
    } catch (err) {
      setSubmitError(mapApiError(err));
    }
  }, [persistCatalogAndMedia, router, mapApiError]);

  const handleMediaStepAction = useCallback(
    async (action: (id: number) => void | Promise<void>) => {
      setSubmitError(null);
      setFieldErrors({});
      try {
        const id = await persistCatalogAndMedia();
        await action(id);
      } catch (err) {
        setSubmitError(mapApiError(err));
      }
    },
    [persistCatalogAndMedia, mapApiError],
  );

  useFormUX({
    values: catalog,
    initialValues: catalog,
    isSubmitting: isBusy,
    storageKey: listingId ? `draft-listing-wizard-${listingId}` : 'draft-listing-wizard-new',
  });

  const handleNext = useCallback(async () => {
    setSubmitError(null);
    setFieldErrors({});

    const validateProductStep = () => {
      const parsed = createWizardBasicStepSchema(t).safeParse({
        title: catalog.title,
        categoryId: catalog.categoryId,
        brand: catalog.brand,
        model: catalog.model,
        condition: catalog.condition,
        authenticity: catalog.authenticity,
        sku: catalog.sku,
      });
      if (!parsed.success) {
        const mapped = zodIssuesToFieldMap(parsed.error);
        setFieldErrors(mapped);
        if (
          isMobile &&
          Object.keys(mapped).some((f) =>
            ['brand', 'model', 'condition', 'authenticity', 'sku'].includes(f),
          )
        ) {
          setShowMoreDetails(true);
        }
        return false;
      }
      createWizardDescriptionStepSchema().safeParse({ description: catalog.description });
      return true;
    };

    try {
      if (currentStep === step.PRODUCT) {
        if (!validateProductStep()) return;
        if (isMerchant || isMobile) {
          const id = await saveCatalog();
          setListingId(id);
          goToStep(step.MEDIA);
        } else {
          goToStep(DESKTOP_WIZARD_STEP.DETAILS);
        }
        return;
      }

      if (!isMerchant && !isMobile && currentStep === DESKTOP_WIZARD_STEP.DETAILS) {
        const id = await saveCatalog();
        setListingId(id);
        goToStep(step.MEDIA);
        return;
      }

      if (currentStep === step.MEDIA) {
        await persistCatalogAndMedia();
        if (isMerchant || maxStep <= step.MEDIA) {
          setShowSubmitSuccess(true);
          return;
        }
        goToStep(fullLayoutStep.CHANNEL);
        return;
      }

      if ((!isMerchant || isPublishFlow) && currentStep === fullLayoutStep.CHANNEL) {
        if (!deployChannel) {
          setSubmitError(t('listing.wizard.channel_required') || 'Select a sales channel');
          return;
        }
        goToStep(fullLayoutStep.PUBLISH);
        return;
      }
    } catch (err: unknown) {
      setSubmitError(mapApiError(err) || t('common.error_occurred') || 'Error');
    }
  }, [catalog, t, isMobile, isMerchant, currentStep, step, fullLayoutStep, saveCatalog, goToStep, persistCatalogAndMedia, isPublishFlow, deployChannel, maxStep, mapApiError]);

  const handlePublish = useCallback(async () => {
    if (!listingId || !deployChannel) return;

    setSubmitError(null);
    setFieldErrors({});

    const deployAuctionSchema = createDeployAuctionClientSchema(t);
    const deployGroupBuySchema = createDeployGroupBuyClientSchema(t);
    if (deployChannel === 'auction') {
      const finalEndTime = auctionUseDurationMode ? auctionComputedEndTime : auctionPricing.endTime;
      const parsed = deployAuctionSchema.safeParse({
        ...auctionPricing,
        endTime: finalEndTime,
      });
      if (!parsed.success) {
        const mapped = zodIssuesToFieldMap(parsed.error);
        setFieldErrors(mapped);
        if (Object.keys(mapped).some((f) => ['originalPrice', 'bidIncrement'].includes(f))) {
          if (isMobile) setShowAdvancedPricing(true);
        }
        return;
      }
    } else {
      const finalGroupBuyEndTime = groupBuyUseDurationMode
        ? groupBuyComputedEndTime
        : groupBuyPricing.endTime;
      const parsed = deployGroupBuySchema.safeParse({
        ...groupBuyPricing,
        endTime: finalGroupBuyEndTime,
      });
      if (!parsed.success) {
        setFieldErrors(zodIssuesToFieldMap(parsed.error));
        return;
      }
    }

    try {
      if (deployChannel === 'auction') {
        const finalEndTime = auctionUseDurationMode ? auctionComputedEndTime : auctionPricing.endTime;
        const originalPrice = parseOptionalListingPrice(auctionPricing.originalPrice);
        const auction = await deployAuctionMutation.mutateAsync({
          id: listingId,
          data: {
            startPrice: parseRequiredListingPrice(auctionPricing.startPrice),
            ...(originalPrice !== undefined ? { originalPrice } : {}),
            bidIncrement: parseBidIncrement(auctionPricing.bidIncrement, 5000),
            startTime: new Date(auctionPricing.startTime).toISOString(),
            endTime: new Date(finalEndTime).toISOString(),
          },
        });
        const auctionId = auction?.id;
        if (listingId) queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
        router.push(
          auctionId ? `/auctions/${auctionId}` : `/listings/${listingId}`,
        );
      } else {
        const finalGroupBuyEndTime = groupBuyUseDurationMode
          ? groupBuyComputedEndTime
          : groupBuyPricing.endTime;
        const deal = await deployGroupBuyMutation.mutateAsync({
          id: listingId,
          data: {
            originalPrice: Number(groupBuyPricing.originalPrice),
            dealPrice: Number(groupBuyPricing.dealPrice),
            minParticipants: Number(groupBuyPricing.minParticipants),
            maxParticipants: Number(groupBuyPricing.maxParticipants),
            startTime: new Date(groupBuyPricing.startTime).toISOString(),
            endTime: new Date(finalGroupBuyEndTime).toISOString(),
            autoCreateOrder: true,
          },
        });
        const dealId = deal?.id;
        if (listingId) queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
        router.push(
          dealId ? `/group-buying/${dealId}` : `/listings/${listingId}`,
        );
      }
    } catch (err: unknown) {
      const apiFields = mapApiFieldErrors(err);
      const { _form, ...inlineFields } = apiFields;
      if (Object.keys(inlineFields).length) setFieldErrors(inlineFields);
      setSubmitError(
        _form ||
          mapApiError(err, { firstOnly: true }) ||
          t('listing.deploy.error_reason_unknown'),
      );
    }
  }, [listingId, deployChannel, t, auctionUseDurationMode, auctionComputedEndTime, auctionPricing, groupBuyUseDurationMode, groupBuyComputedEndTime, groupBuyPricing, isMobile, deployAuctionMutation, deployGroupBuyMutation, queryClient, router, mapApiFieldErrors, mapApiError]);

  const onBarcodeLookup = useCallback(async (barcode: string) => {
    if (!barcode) return;
    try {
      const found = await lookupByBarcodeMutation.mutateAsync(barcode);
      if (found) {
        setBarcodeFoundListing(found);
        setShowBarcodeDialog(true);
      }
    } catch {
      // Not found — continue normal flow
    }
  }, [lookupByBarcodeMutation]);

  const effectiveStepLabelKeys = useMemo(() => {
    if (!isPublishFlow) return wizardLayout.stepLabelKeys;
    return wizardLayout.stepLabelKeys.map((key, index) => {
      const channelIdx = fullLayoutStep.CHANNEL - 1;
      const publishIdx = fullLayoutStep.PUBLISH - 1;
      if (index === channelIdx) return 'listing.wizard.step.channel_publish';
      if (index === publishIdx) return 'listing.wizard.step.pricing_publish';
      return key;
    });
  }, [isPublishFlow, wizardLayout.stepLabelKeys, fullLayoutStep.CHANNEL, fullLayoutStep.PUBLISH]);

  const wizardGalleryImages = useMemo(() => {
    if (imageUpload.previewUrls.length > 0) return imageUpload.previewUrls;
    if (!existingListing) return [] as string[];
    return buildListingGalleryImages(existingListing, listingAttachmentUrlMap);
  }, [imageUpload.previewUrls, existingListing, listingAttachmentUrlMap]);

  const showPublishSteps = (isAdmin || isPublishFlow) && maxStep > step.MEDIA;

  return {
    // Router & client
    router,
    isClient,
    // Wizard config
    wizardMode,
    isPublishFlow,
    isMerchant,
    isTrustedMerchant,
    isAdmin,
    isMobile,
    useMerchantWizardLayout,
    wizardLayout,
    step,
    fullLayoutStep,
    maxStep,
    // State
    currentStep,
    listingId,
    submitError,
    fieldErrors,
    showMoreDetails,
    showOptionalDetails,
    showAdvancedPricing,
    catalog,
    deployChannel,
    auctionPricing,
    groupBuyPricing,
    showSubmitSuccess,
    showImportedBanner,
    // Computed
    isBusy,
    isListingApproved,
    approvalStatus,
    showPublishSteps,
    invalidListingId,
    stepOutOfRange,
    importedBanner,
    effectiveStepLabelKeys,
    wizardGalleryImages,
    // Listing data
    existingListing,
    listingLoading,
    listingLoadError,
    listingFetchError,
    refetchListing,
    // Mutations
    createMutation,
    updateMutation,
    deployAuctionMutation,
    deployGroupBuyMutation,
    submitForReviewMutation,
    lookupByBarcodeMutation,
    isBarcodeLookupPending: lookupByBarcodeMutation.isPending,
    // Auction duration
    auctionDurationDays,
    setAuctionDurationDays,
    auctionUseDurationMode,
    setAuctionUseDurationMode,
    auctionComputedEndTime,
    groupBuyDurationDays,
    setGroupBuyDurationDays,
    groupBuyUseDurationMode,
    setGroupBuyUseDurationMode,
    groupBuyComputedEndTime,
    // Media
    imageUpload,
    isUploading,
    uploadProgress,
    uploadError,
    retainedAttachmentIds,
    setRetainedAttachmentIds,
    handleImageReorder,
    // Barcode
    barcodeFoundListing,
    shouldRenderBarcodeDialog,
    closeBarcodeDialog,
    onBarcodeLookup,
    brands,
    // Actions
    setCatalog,
    setDeployChannel,
    setAuctionPricing,
    setGroupBuyPricing,
    setCurrentStep,
    setSubmitError,
    setFieldErrors,
    setShowMoreDetails,
    setShowOptionalDetails,
    setShowAdvancedPricing,
    setShowSubmitSuccess,
    setShowImportedBanner,
    goToStep,
    goToPublishFlow,
    submitListing,
    handleSaveAndExit,
    handleMediaStepAction,
    handleNext,
    handlePublish,
  };
}

export type UseListingWizardReturn = ReturnType<typeof useListingWizard>;
