import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  Image as ImageIcon,
  Gavel,
  Users,
  Rocket,
  AlertCircle,
  X,
  SendHorizonal,
  CheckCircle,
  ScanBarcode,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import { useIsMobile } from '@core/hooks/useIsMobile';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberImageUpload } from '@core/components/AmberImageUpload';
import { AmberFormSkeleton } from '@core/components/Loading/AmberFormSkeleton';
import { FormSection } from '@core/components/FormSection';
import { FormBuilder } from '@core/components/Form/FormBuilder';
import { IqdSymbol } from '@core/components/IqdSymbol';
import { EmptyState } from '@core/components/EmptyState';
import { useFormUX } from '@core/hooks/useFormUX';
import { useFileUpload } from '@core/hooks/useFileUpload';
import { usePendingImageFiles } from '@core/hooks/usePendingImageFiles';
import { useMapApiValidationError } from '@core/hooks/useMapApiValidationError';
import { useMapApiValidationFieldErrors } from '@core/hooks/useMapApiValidationFieldErrors';
import { zodIssuesToFieldMap } from '@core/validation/zodIssuesToFieldMap';
import {
  parseBidIncrement,
  parseOptionalListingPrice,
  parseRequiredListingPrice,
} from '@core/utils/listingDeployPrices';
import { useList as useCategories } from '../../../services/categories/hooks';
import { getLocalizedName } from '../../../services/categories/types';
import type { FormFieldConfig } from '@core/services/types';
import type { ListingSpec, ListingSource, CreateListingInput, ProductListing } from '../../../types/services/listings.types';
import {
  useCreateListing,
  useUpdateListing,
  useGetListing,
  useDeployAsAuction,
  useDeployAsGroupBuy,
  useSubmitListingForReview,
  useLookupByBarcode,
} from '../api/listing-hooks';
import { ListingSpecsEditor } from '../components/ListingSpecsEditor';
import { ListingSourcesEditor } from '../components/ListingSourcesEditor';
import { ListingWizardStepIndicator } from '../components/ListingWizardStepIndicator';
import { FieldHelpHint } from '../components/FieldHelpHint';
import { ListingImage } from '../components/ListingImage';
import {
  getWizardLayout,
  normalizeWizardStepFromQuery,
  remapWizardStep,
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

export type ListingWizardMode = 'create' | 'edit' | 'publish-only';

export interface ListingWizardPageProps {
  mode?: ListingWizardMode;
  /** Last step number (e.g. 5 for catalog-only edit). */
  maxStep?: number;
}

type DeployChannel = 'auction' | 'group_buy' | null;

function filterSpecs(specs: ListingSpec[]): ListingSpec[] {
  return specs.filter((s) => s.label.trim() || s.value.trim());
}

function filterSources(sources: ListingSource[]): ListingSource[] {
  return sources.filter((s) => s.label.trim() || s.url.trim());
}

export const ListingWizardPage: React.FC<ListingWizardPageProps> = ({
  mode: modeProp,
  maxStep: maxStepProp,
}) => {
  const { t, dir, language } = useLanguage();
  const router = useRouter();
  const mapApiError = useMapApiValidationError();
  const mapApiFieldErrors = useMapApiValidationFieldErrors();
  const isRTL = dir === 'rtl';

  const routeId = router.query.id ? Number(router.query.id) : undefined;
  const queryStep = router.query.step ? Number(router.query.step) : undefined;
  const queryType = router.query.type as string | undefined;

  const wizardMode: ListingWizardMode =
    modeProp ??
    (router.pathname.includes('/publish')
      ? 'publish-only'
      : routeId
        ? 'edit'
        : 'create');

  const { isMerchant, isAdmin } = useDashboardRole();
  const { isMobile } = useIsMobile();
  const wizardLayout = useMemo(
    () => getWizardLayout(isMobile, { merchant: isMerchant }),
    [isMobile, isMerchant],
  );
  const step = wizardLayout.step;
  const fullLayoutStep = useMemo(
    () => (isMobile ? MOBILE_WIZARD_STEP : DESKTOP_WIZARD_STEP),
    [isMobile],
  );
  const prevIsMobileRef = useRef<boolean | null>(null);

  const maxStep = isMerchant
    ? wizardLayout.totalSteps
    : maxStepProp ?? (wizardMode === 'edit' ? step.MEDIA : wizardLayout.totalSteps);

  const initialStep = useMemo(() => {
    if (queryStep) {
      const normalized = normalizeWizardStepFromQuery(queryStep, maxStep, isMobile, {
        merchant: isMerchant,
      });
      if (normalized >= 1 && normalized <= maxStep) return normalized;
    }
    if (wizardMode === 'publish-only') return fullLayoutStep.CHANNEL;
    return step.PRODUCT;
  }, [queryStep, wizardMode, maxStep, isMobile, isMerchant, fullLayoutStep.CHANNEL, step.PRODUCT]);

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [listingId, setListingId] = useState<number | undefined>(routeId);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);
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

  const [auctionPricing, setAuctionPricing] = useState({
    startPrice: 0,
    originalPrice: '',
    bidIncrement: 5000,
  });

  const [groupBuyPricing, setGroupBuyPricing] = useState({
    originalPrice: 0,
    dealPrice: 0,
    minParticipants: 2,
    maxParticipants: 100,
  });

  const imageUpload = usePendingImageFiles();
  const { uploadMultiple, isUploading, progress: uploadProgress, error: uploadError } =
    useFileUpload();
  const [retainedAttachmentIds, setRetainedAttachmentIds] = useState<number[]>([]);

  const { data: existingListing, isLoading: listingLoading } = useGetListing(
    listingId!,
    !!listingId && wizardMode !== 'create',
  );
  const { data: categoriesData } = useCategories({ limit: 100 });
  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();
  const deployAuctionMutation = useDeployAsAuction();
  const deployGroupBuyMutation = useDeployAsGroupBuy();
  const submitForReviewMutation = useSubmitListingForReview();

  const lookupByBarcodeMutation = useLookupByBarcode();
  const [barcodeFoundListing, setBarcodeFoundListing] = useState<ProductListing | null>(null);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);

  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

  const categoryOptions = useMemo(
    () =>
      (categoriesData as { categories?: unknown[] })?.categories?.map((c: unknown) => {
        const cat = c as { id: string | number; name?: string; slug?: string };
        return {
          label: getLocalizedName(cat as never, language) || cat.name || cat.slug || String(cat.id),
          value: String(cat.id),
        };
      }) || [],
    [categoriesData, language],
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        merchant: isMerchant,
      });
      return Math.max(step.PRODUCT, Math.min(maxStep, remapped));
    });
    prevIsMobileRef.current = isMobile;
  }, [isMobile, maxStep, step.PRODUCT, isMerchant]);

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
      imageUpload.resetFromServer(existingListing.images || []);
      setRetainedAttachmentIds(existingListing.attachmentIds || []);
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
  }, [existingListing, imageUpload.resetFromServer, isMobile]);

  const syncStepUrl = useCallback(
    (step: number) => {
      if (!router.isReady) return;
      const base =
        wizardMode === 'publish-only' && listingId
          ? `/listings/${listingId}/publish`
          : wizardMode === 'edit' && listingId
            ? `/listings/${listingId}/edit`
            : '/listings/new';
      const query: Record<string, string> = { step: String(step) };
      if (!isMerchant) {
        if (deployChannel === 'auction') query.type = 'auction';
        if (deployChannel === 'group_buy') query.type = 'group-buy';
      }
      router.replace({ pathname: base, query }, undefined, { shallow: true });
    },
    [router, wizardMode, listingId, deployChannel, isMerchant],
  );

  const goToStep = (step: number) => {
    const clamped = Math.max(1, Math.min(maxStep, step));
    setCurrentStep(clamped);
    syncStepUrl(clamped);
  };

  const buildCatalogPayload = (): CreateListingInput => ({
    title: catalog.title.trim(),
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
  });

  const saveCatalog = async (): Promise<number> => {
    const payload = buildCatalogPayload();
    if (listingId) {
      await updateMutation.mutateAsync({ id: listingId, data: payload });
      return listingId;
    }
    const created = await createMutation.mutateAsync(payload);
    setListingId(created.id);
    return created.id;
  };

  const saveMedia = async (id: number) => {
    const newAttachmentIds =
      imageUpload.pendingFiles.length > 0 ? await uploadMultiple(imageUpload.pendingFiles) : [];
    const allAttachmentIds = [...retainedAttachmentIds, ...newAttachmentIds];
    if (allAttachmentIds.length > 0) {
      await updateMutation.mutateAsync({
        id,
        data: {
          mainAttachmentId: allAttachmentIds[0],
          attachmentIds: allAttachmentIds,
        },
      });
    }
  };

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    isUploading ||
    deployAuctionMutation.isPending ||
    deployGroupBuyMutation.isPending ||
    submitForReviewMutation.isPending;

  useFormUX({
    values: catalog,
    initialValues: catalog,
    isSubmitting: isBusy,
    storageKey: listingId ? `draft-listing-wizard-${listingId}` : 'draft-listing-wizard-new',
  });

  const handleNext = async () => {
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
        let id = listingId;
        if (isMerchant || isMobile) {
          id = await saveCatalog();
          setListingId(id);
        }
        if (!id) {
          setSubmitError(t('common.error_occurred') || 'Error');
          return;
        }
        await saveMedia(id);
        if (isMerchant || maxStep <= step.MEDIA) {
          setShowSubmitSuccess(true);
          return;
        }
        goToStep(fullLayoutStep.CHANNEL);
        return;
      }

      if (!isMerchant && currentStep === fullLayoutStep.CHANNEL) {
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
  };

  const handlePublish = async () => {
    if (!listingId || !deployChannel) return;

    setSubmitError(null);
    setFieldErrors({});

    const deployAuctionSchema = createDeployAuctionClientSchema(t);
    const deployGroupBuySchema = createDeployGroupBuyClientSchema(t);
    if (deployChannel === 'auction') {
      const parsed = deployAuctionSchema.safeParse(auctionPricing);
      if (!parsed.success) {
        const mapped = zodIssuesToFieldMap(parsed.error);
        setFieldErrors(mapped);
        if (Object.keys(mapped).some((f) => ['originalPrice', 'bidIncrement'].includes(f))) {
          if (isMobile) setShowAdvancedPricing(true);
        }
        return;
      }
    } else {
      const parsed = deployGroupBuySchema.safeParse(groupBuyPricing);
      if (!parsed.success) {
        setFieldErrors(zodIssuesToFieldMap(parsed.error));
        return;
      }
    }

    try {
      if (deployChannel === 'auction') {
        const originalPrice = parseOptionalListingPrice(auctionPricing.originalPrice);
        const auction = await deployAuctionMutation.mutateAsync({
          id: listingId,
          data: {
            startPrice: parseRequiredListingPrice(auctionPricing.startPrice),
            ...(originalPrice !== undefined ? { originalPrice } : {}),
            bidIncrement: parseBidIncrement(auctionPricing.bidIncrement, 5000),
          },
        });
        const auctionId = auction?.id;
        router.push(
          auctionId ? `/auctions/${auctionId}` : `/listings/${listingId}`,
        );
      } else {
        const deal = await deployGroupBuyMutation.mutateAsync({
          id: listingId,
          data: {
            originalPrice: Number(groupBuyPricing.originalPrice),
            dealPrice: Number(groupBuyPricing.dealPrice),
            minParticipants: Number(groupBuyPricing.minParticipants),
            maxParticipants: Number(groupBuyPricing.maxParticipants),
            autoCreateOrder: true,
          },
        });
        const dealId = deal?.id;
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
  };

  const essentialFields: FormFieldConfig[] = useMemo(
    () => [
      {
        name: 'title',
        label: t('listing.form.title') || 'Title',
        type: 'text',
        placeholder: t('listing.form.title_placeholder'),
        required: true,
      },
      {
        name: 'categoryId',
        label: t('listing.form.category') || 'Category',
        type: 'select',
        placeholder: t('common.select'),
        options: categoryOptions,
      },
    ],
    [t, categoryOptions],
  );

  const advancedFields: FormFieldConfig[] = useMemo(
    () => [
      {
        name: 'brand',
        label: t('listing.form.brand') || 'Brand',
        type: 'text',
        placeholder: t('listing.form.brand_placeholder'),
      },
      {
        name: 'model',
        label: t('listing.form.model') || 'Model',
        type: 'text',
        placeholder: t('listing.form.model_placeholder'),
      },
      {
        name: 'condition',
        label: t('listing.form.condition') || 'Condition',
        type: 'select',
        placeholder: t('common.select'),
        options: [
          { label: t('common.condition_new') || 'New', value: 'new' },
          { label: t('common.condition_used') || 'Used', value: 'used' },
          { label: t('common.condition_open_box') || 'Open Box', value: 'open_box' },
          { label: t('common.condition_refurbished') || 'Refurbished', value: 'refurbished' },
        ],
      },
      {
        name: 'authenticity',
        label: t('listing.form.authenticity') || 'Authenticity',
        type: 'select',
        placeholder: t('common.select'),
        options: [
          { label: t('common.authenticity_original') || 'Original', value: 'original' },
          { label: t('common.authenticity_copy') || 'Copy', value: 'copy' },
          { label: t('common.authenticity_high_copy') || 'High Copy', value: 'high_copy' },
        ],
      },
      {
        name: 'sku',
        label: t('listing.form.sku') || 'SKU',
        type: 'text',
        placeholder: t('listing.form.sku_placeholder'),
      },
    ],
    [t],
  );

  const basicFields: FormFieldConfig[] = useMemo(
    () => [...essentialFields, ...advancedFields],
    [essentialFields, advancedFields],
  );

  const catalogFormValues = useMemo(
    () => ({
      title: catalog.title,
      categoryId: catalog.categoryId ? String(catalog.categoryId) : '',
      brand: catalog.brand,
      model: catalog.model,
      condition: catalog.condition,
      authenticity: catalog.authenticity,
      sku: catalog.sku,
      barcode: catalog.barcode,
    }),
    [catalog],
  );

  const handleCatalogChange = (data: Record<string, unknown>, field: string, value: unknown) => {
    setCatalog((prev) => ({
      ...prev,
      [field]: field === 'categoryId' ? (value ? Number(value) : undefined) : value,
    }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (!isClient) return null;

  if (listingId && listingLoading && wizardMode !== 'create') {
    return <AmberFormSkeleton fields={6} header actions layout="grid" />;
  }

  if (wizardMode === 'publish-only' && listingId && !existingListing && !listingLoading) {
    return <EmptyState icon={Package} title={t('listing.detail.not_found') || 'Not Found'} />;
  }

  const listingCoverUrl = existingListing ?? null;
  const showPublishSteps = isAdmin && maxStep > step.MEDIA;
  const pageTitle =
    wizardMode === 'create'
      ? t('listing.wizard.title_create')
      : wizardMode === 'publish-only'
        ? t('listing.wizard.title_publish')
        : t('listing.wizard.title_edit');

  return (
    <div className="space-y-4 md:space-y-8 p-3 md:p-6 max-w-[1200px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {submitError && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium whitespace-pre-line">{submitError}</p>
          <button type="button" onClick={() => setSubmitError(null)} className="ml-auto text-danger/60 hover:text-danger">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showSubmitSuccess && listingId && (
        <div className="bg-success/10 border border-success/20 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-lg font-black text-zinc-text uppercase">{t('listing.wizard.saved') || 'Product Saved'}</p>
              <p className="text-sm text-zinc-muted">{t('listing.wizard.submit_prompt') || 'Your product has been saved. Submit it for review to get approved.'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <AmberButton
              className="h-11 bg-brand text-black font-black rounded-xl px-6 gap-2 active:scale-95 transition-all"
              disabled={submitForReviewMutation.isPending}
              onClick={() => {
                submitForReviewMutation.mutate(listingId, {
                  onSuccess: () => {
                    setShowSubmitSuccess(false);
                    router.push(`/listings/${listingId}`);
                  },
                });
              }}
            >
              {submitForReviewMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <SendHorizonal className="w-4 h-4" />
              )}
              {t('approval.actions.submit') || 'Submit for Review'}
            </AmberButton>
            <AmberButton
              variant="outline"
              className="h-11 border-border font-bold rounded-xl px-6 active:scale-95 transition-all"
              onClick={() => router.push(`/listings/${listingId}`)}
            >
              {t('listing.form.save') || 'Save Draft'}
            </AmberButton>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <AmberButton
            variant="secondary"
            className="p-0 w-11 h-11 rounded-xl flex items-center justify-center"
            onClick={() => {
              if (currentStep > 1) goToStep(currentStep - 1);
              else router.push(listingId ? `/listings/${listingId}` : '/listings');
            }}
          >
            <ChevronLeft className={cn('w-5 h-5', isRTL && 'rotate-180')} />
          </AmberButton>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-zinc-text tracking-tighter uppercase leading-none">
              {pageTitle}
            </h1>
            {existingListing?.title && (
              <p className="text-sm text-zinc-muted font-bold uppercase mt-1">{existingListing.title}</p>
            )}
          </div>
        </div>
      </div>

      <ListingWizardStepIndicator
        currentStep={currentStep}
        maxStep={maxStep}
        minStep={wizardMode === 'publish-only' ? fullLayoutStep.CHANNEL : 1}
        stepLabelKeys={wizardLayout.stepLabelKeys}
      />

      {currentStep === step.PRODUCT && (
        <div className="space-y-8">
          <FormSection icon={<Package className="w-5 h-5" />} iconBgColor="brand" title={t('listing.wizard.step.product')}>
            <FormBuilder
              fields={isMobile ? essentialFields : basicFields}
              initialValues={catalogFormValues}
              onSubmit={() => {}}
              showActions={false}
              layout="vertical"
              onChange={handleCatalogChange}
            />
            <div className="mt-6 space-y-2">
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                {t('listing.form.description')}
              </label>
              <textarea
                className={cn(
                  'w-full rounded-xl bg-obsidian-panel border border-border p-4 text-sm text-zinc-text font-medium',
                  isMobile ? 'min-h-[120px]' : 'min-h-[160px]',
                )}
                placeholder={t('listing.form.description_placeholder')}
                value={catalog.description}
                onChange={(e) => setCatalog((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            {/* Barcode scan / lookup */}
            <div className="mt-6 space-y-2">
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                {t('listing.form.barcode') || 'Barcode'}
              </label>
              <div className="flex gap-2">
                <AmberInput
                  placeholder={t('listing.form.barcode_placeholder') || 'Scan or enter barcode...'}
                  value={catalog.barcode}
                  onChange={(e) => {
                    setCatalog((p) => ({ ...p, barcode: e.target.value }));
                    if (fieldErrors.barcode) {
                      setFieldErrors((prev) => { const n = { ...prev }; delete n.barcode; return n; });
                    }
                  }}
                  error={fieldErrors.barcode}
                />
                <AmberButton
                  variant="outline"
                  className="h-11 px-4 shrink-0 rounded-xl border-border"
                  disabled={!catalog.barcode.trim() || lookupByBarcodeMutation.isPending}
                  onClick={async () => {
                    const barcode = catalog.barcode.trim();
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
                  }}
                >
                  {lookupByBarcodeMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-zinc-muted border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ScanBarcode className="w-4 h-4" />
                  )}
                </AmberButton>
              </div>
              <p className="text-[10px] text-zinc-muted">
                {t('listing.form.barcode_hint') || 'Enter EAN/UPC barcode to check for existing products'}
              </p>
            </div>

            {/* Barcode found dialog */}
            {showBarcodeDialog && barcodeFoundListing && typeof window !== 'undefined' && ReactDOM.createPortal(
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
                <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                        {t('listing.barcode.found_title') || 'Product Already Exists'}
                      </h3>
                      <p className="text-[13px] text-zinc-muted font-bold truncate max-w-[280px]">
                        {barcodeFoundListing.title}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-muted mb-5">
                    {t('listing.barcode.found_desc') || 'A product with this barcode already exists in the catalog. You can view it or continue creating a new listing.'}
                  </p>
                  <div className="flex items-center justify-end gap-3">
                    <AmberButton
                      variant="outline"
                      className="h-10 px-5 font-bold uppercase tracking-wider text-xs"
                      onClick={() => {
                        setShowBarcodeDialog(false);
                        setBarcodeFoundListing(null);
                      }}
                    >
                      {t('listing.barcode.continue_create') || 'Continue Creating'}
                    </AmberButton>
                    <AmberButton
                      className="h-10 px-5 font-bold uppercase tracking-wider text-xs bg-brand text-black border-none"
                      onClick={() => {
                        setShowBarcodeDialog(false);
                        if (barcodeFoundListing.id) {
                          router.push(`/listings/${barcodeFoundListing.id}`);
                        }
                      }}
                    >
                      <ExternalLink className="w-3 h-3 me-1" />
                      {t('listing.barcode.view_product') || 'View Product'}
                    </AmberButton>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {isMobile && (
              <>
                <button
                  type="button"
                  onClick={() => setShowMoreDetails((open) => !open)}
                  className={cn(
                    'mt-6 w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors',
                    isRTL && 'flex-row-reverse',
                  )}
                >
                  <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                    {t('listing.wizard.more_details')}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-zinc-muted transition-transform',
                      showMoreDetails && 'rotate-180',
                    )}
                  />
                </button>

                {showMoreDetails && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <FormBuilder
                      fields={advancedFields}
                      initialValues={catalogFormValues}
                      onSubmit={() => {}}
                      showActions={false}
                      layout="vertical"
                      onChange={handleCatalogChange}
                    />
                  </div>
                )}
              </>
            )}
          </FormSection>
        </div>
      )}

      {!isMerchant && !isMobile && currentStep === DESKTOP_WIZARD_STEP.DETAILS && (
        <div className="space-y-8">
          <ListingSpecsEditor
            specs={catalog.specs}
            onChange={(specs) => setCatalog((p) => ({ ...p, specs }))}
          />
          <ListingSourcesEditor
            sources={catalog.sources}
            onChange={(sources) => setCatalog((p) => ({ ...p, sources }))}
          />
        </div>
      )}

      {currentStep === step.MEDIA && (
        <div className={cn(isMobile && 'space-y-6')}>
          <FormSection icon={<ImageIcon className="w-5 h-5" />} iconBgColor="info" title={t('listing.wizard.step.media')}>
            <AmberImageUpload
              value={imageUpload.previewUrls}
              onChange={(files) => {
                if (files?.length) imageUpload.appendFiles(files);
              }}
              onRemove={(index) => {
                const existingCount = imageUpload.previewUrls.length - imageUpload.pendingFiles.length;
                if (index < existingCount) {
                  setRetainedAttachmentIds((prev) => prev.filter((_, i) => i !== index));
                }
                imageUpload.removeAt(index);
              }}
              onReorder={(newOrder) => imageUpload.reorder(newOrder)}
              multiple
              sortable
              disabled={isUploading}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
            />
            <p className="text-[11px] text-zinc-muted font-bold uppercase tracking-widest text-center mt-4">
              {t('common.image_upload_hint')}
            </p>
          </FormSection>

          {(isMobile || isMerchant) && (
            <>
              <button
                type="button"
                onClick={() => setShowOptionalDetails((open) => !open)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors',
                  isRTL && 'flex-row-reverse',
                )}
              >
                <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                  {t('listing.wizard.optional_details')}
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-zinc-muted transition-transform',
                    showOptionalDetails && 'rotate-180',
                  )}
                />
              </button>

              {showOptionalDetails && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <ListingSpecsEditor
                    specs={catalog.specs}
                    onChange={(specs) => setCatalog((p) => ({ ...p, specs }))}
                  />
                  <ListingSourcesEditor
                    sources={catalog.sources}
                    onChange={(sources) => setCatalog((p) => ({ ...p, sources }))}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {currentStep === fullLayoutStep.CHANNEL && showPublishSteps && (
        <div className="space-y-4">
          <p className="text-sm font-black text-zinc-muted uppercase tracking-[0.25em]">
            {t('listing.deploy.choose')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <button
              type="button"
              onClick={() => {
                setDeployChannel('auction');
                setFieldErrors({});
              }}
              className={cn(
                'p-4 md:p-8 rounded-2xl bg-obsidian-card border transition-all text-left',
                deployChannel === 'auction' ? 'border-brand/30' : 'border-white/5 hover:border-brand/20',
              )}
            >
              <Gavel className="w-7 h-7 text-brand mb-4" />
              <h3 className="text-lg font-black text-zinc-text uppercase">{t('listing.deploy.as_auction')}</h3>
              <p className="text-sm text-zinc-muted mt-2">{t('listing.deploy.as_auction_desc')}</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setDeployChannel('group_buy');
                setFieldErrors({});
              }}
              className={cn(
                'p-4 md:p-8 rounded-2xl bg-obsidian-card border transition-all text-left',
                deployChannel === 'group_buy' ? 'border-info/30' : 'border-white/5 hover:border-info/20',
              )}
            >
              <Users className="w-7 h-7 text-info mb-4" />
              <h3 className="text-lg font-black text-zinc-text uppercase">{t('listing.deploy.as_group_buy')}</h3>
              <p className="text-sm text-zinc-muted mt-2">{t('listing.deploy.as_group_buy_desc')}</p>
            </button>
          </div>
        </div>
      )}

      {currentStep === fullLayoutStep.PUBLISH && showPublishSteps && deployChannel === 'auction' && (
        <FormSection icon={<Gavel className="w-5 h-5" />} iconBgColor="brand" title={t('listing.deploy.auction_settings')}>
          <div className="space-y-6">
            <AmberInput
              label={t('listing.deploy.start_price')}
              type="number"
              value={auctionPricing.startPrice}
              onChange={(e) => {
                setFieldErrors((p) => {
                  const n = { ...p };
                  delete n.startPrice;
                  return n;
                });
                setAuctionPricing((prev) => ({ ...prev, startPrice: Number(e.target.value) }));
              }}
              icon={<IqdSymbol />}
              error={fieldErrors.startPrice}
              rightElement={<FieldHelpHint text={t('listing.deploy.hint.start_price')} />}
            />

            {isMobile ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowAdvancedPricing((open) => !open)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors',
                    isRTL && 'flex-row-reverse',
                  )}
                >
                  <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                    {t('listing.wizard.advanced_pricing')}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-zinc-muted transition-transform',
                      showAdvancedPricing && 'rotate-180',
                    )}
                  />
                </button>

                {showAdvancedPricing && (
                  <div className="space-y-6 pt-2 border-t border-white/5">
                    <AmberInput
                      label={t('listing.deploy.auction_original_price')}
                      type="number"
                      value={auctionPricing.originalPrice}
                      onChange={(e) => {
                        setFieldErrors((p) => {
                          const n = { ...p };
                          delete n.originalPrice;
                          return n;
                        });
                        setAuctionPricing((prev) => ({ ...prev, originalPrice: e.target.value }));
                      }}
                      icon={<IqdSymbol />}
                      error={fieldErrors.originalPrice}
                      rightElement={<FieldHelpHint text={t('listing.deploy.hint.auction_original_price')} />}
                    />
                    <AmberInput
                      label={t('listing.deploy.bid_increment')}
                      type="number"
                      value={auctionPricing.bidIncrement}
                      onChange={(e) => {
                        setFieldErrors((p) => {
                          const n = { ...p };
                          delete n.bidIncrement;
                          return n;
                        });
                        setAuctionPricing((prev) => ({ ...prev, bidIncrement: Number(e.target.value) }));
                      }}
                      icon={<Gavel className="w-4 h-4" />}
                      error={fieldErrors.bidIncrement}
                      rightElement={<FieldHelpHint text={t('listing.deploy.hint.bid_increment')} />}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <AmberInput
                  label={t('listing.deploy.auction_original_price')}
                  type="number"
                  value={auctionPricing.originalPrice}
                  onChange={(e) => {
                    setFieldErrors((p) => {
                      const n = { ...p };
                      delete n.originalPrice;
                      return n;
                    });
                    setAuctionPricing((prev) => ({ ...prev, originalPrice: e.target.value }));
                  }}
                  icon={<IqdSymbol />}
                  error={fieldErrors.originalPrice}
                  rightElement={<FieldHelpHint text={t('listing.deploy.hint.auction_original_price')} />}
                />
                <AmberInput
                  label={t('listing.deploy.bid_increment')}
                  type="number"
                  value={auctionPricing.bidIncrement}
                  onChange={(e) => {
                    setFieldErrors((p) => {
                      const n = { ...p };
                      delete n.bidIncrement;
                      return n;
                    });
                    setAuctionPricing((prev) => ({ ...prev, bidIncrement: Number(e.target.value) }));
                  }}
                  icon={<Gavel className="w-4 h-4" />}
                  error={fieldErrors.bidIncrement}
                  rightElement={<FieldHelpHint text={t('listing.deploy.hint.bid_increment')} />}
                />
              </>
            )}
          </div>
        </FormSection>
      )}

      {currentStep === fullLayoutStep.PUBLISH && showPublishSteps && deployChannel === 'group_buy' && (
        <FormSection icon={<Users className="w-5 h-5" />} iconBgColor="info" title={t('listing.deploy.group_buy_settings')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AmberInput
              label={t('listing.deploy.original_price')}
              type="number"
              value={groupBuyPricing.originalPrice}
              onChange={(e) => {
                setFieldErrors((p) => {
                  const n = { ...p };
                  delete n.originalPrice;
                  return n;
                });
                setGroupBuyPricing((p) => ({ ...p, originalPrice: Number(e.target.value) }));
              }}
              icon={<IqdSymbol />}
              error={fieldErrors.originalPrice}
            />
            <AmberInput
              label={t('listing.deploy.deal_price')}
              type="number"
              value={groupBuyPricing.dealPrice}
              onChange={(e) => {
                setFieldErrors((p) => {
                  const n = { ...p };
                  delete n.dealPrice;
                  return n;
                });
                setGroupBuyPricing((p) => ({ ...p, dealPrice: Number(e.target.value) }));
              }}
              error={fieldErrors.dealPrice}
            />
            <AmberInput
              label={t('listing.deploy.min_participants')}
              type="number"
              value={groupBuyPricing.minParticipants}
              onChange={(e) =>
                setGroupBuyPricing((p) => ({ ...p, minParticipants: Number(e.target.value) }))
              }
              error={fieldErrors.minParticipants}
            />
            <AmberInput
              label={t('listing.deploy.max_participants')}
              type="number"
              value={groupBuyPricing.maxParticipants}
              onChange={(e) =>
                setGroupBuyPricing((p) => ({ ...p, maxParticipants: Number(e.target.value) }))
              }
              error={fieldErrors.maxParticipants}
            />
          </div>
        </FormSection>
      )}

      {currentStep === fullLayoutStep.PUBLISH && showPublishSteps && (
        <FormSection icon={<Rocket className="w-5 h-5" />} iconBgColor="brand" title={t('listing.wizard.step.publish')}>
          <div className="space-y-6 text-sm">
            {listingCoverUrl && (
              <ListingImage listing={listingCoverUrl} className="w-20 h-20 rounded-lg object-cover border border-white/10" fallbackClassName="w-8 h-8 text-zinc-muted/40" />
            )}
            <div>
              <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('listing.form.title')}</p>
              <p className="font-bold text-zinc-text">{catalog.title}</p>
            </div>
            <div>
              <p className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">{t('listing.wizard.step.channel')}</p>
              <p className="font-bold text-zinc-text">
                {deployChannel === 'auction' ? t('listing.deploy.as_auction') : t('listing.deploy.as_group_buy')}
              </p>
            </div>
            {deployChannel === 'auction' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.start_price')}</p>
                  <p className="font-black">{auctionPricing.startPrice}</p>
                </div>
                {auctionPricing.originalPrice && (
                  <div>
                    <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.auction_original_price')}</p>
                    <p className="font-black">{auctionPricing.originalPrice}</p>
                  </div>
                )}
              </div>
            )}
            {deployChannel === 'group_buy' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.deal_price')}</p>
                  <p className="font-black">{groupBuyPricing.dealPrice}</p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-muted uppercase">{t('listing.deploy.min_participants')}</p>
                  <p className="font-black">{groupBuyPricing.minParticipants} – {groupBuyPricing.maxParticipants}</p>
                </div>
              </div>
            )}
            <p className="text-[11px] text-zinc-muted font-bold">{t('listing.wizard.review_publish_active')}</p>
          </div>
        </FormSection>
      )}

      <div className="flex justify-between gap-3 pt-4 border-t border-white/5">
        <AmberButton
          variant="outline"
          className="h-11 rounded-xl px-6"
          disabled={currentStep <= 1 || isBusy}
          onClick={() => goToStep(currentStep - 1)}
        >
          {t('listing.wizard.back')}
        </AmberButton>
        {currentStep === step.MEDIA && isMerchant ? (
          <AmberButton
            className="h-11 bg-brand text-black font-black rounded-xl px-8 gap-2"
            disabled={isBusy}
            onClick={() => {
              if (!listingId) {
                void handleNext();
                return;
              }
              submitForReviewMutation.mutate(listingId, {
                onSuccess: () => {
                  setShowSubmitSuccess(false);
                  router.push(`/listings/${listingId}`);
                },
              });
            }}
          >
            {submitForReviewMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendHorizonal className="w-4 h-4" />
            )}
            {t('approval.actions.submit') || 'Submit for Review'}
            <ChevronRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
          </AmberButton>
        ) : currentStep < fullLayoutStep.PUBLISH || !showPublishSteps ? (
          <AmberButton
            className="h-11 bg-brand text-black font-black rounded-xl px-8 gap-2"
            disabled={isBusy}
            onClick={() => void handleNext()}
          >
            {isBusy && (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            )}
            <span>
              {currentStep === step.MEDIA && maxStep === step.MEDIA
                ? t('listing.form.save')
                : t('listing.wizard.next')}
            </span>
            <ChevronRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
          </AmberButton>
        ) : (
          <AmberButton
            className="h-11 bg-brand text-black font-black rounded-xl px-8 gap-2"
            disabled={isBusy}
            onClick={() => void handlePublish()}
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
    </div>
  );
};

export default ListingWizardPage;
