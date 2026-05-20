import type { ProductListing } from '@/types/services/listings.types';

export type Severity = 'warning' | 'info';

export interface Shortcoming {
  field: string;
  severity: Severity;
  messageEn: string;
  messageAr: string;
}

const CHECKS: {
  field: string;
  severity: Severity;
  messageEn: string;
  messageAr: string;
  test: (l: ProductListing) => boolean;
}[] = [
  {
    field: 'images',
    severity: 'warning',
    messageEn: 'No images uploaded — add at least one photo',
    messageAr: 'لم يتم رفع صور — أضف صورة واحدة على الأقل',
    test: (l) => !l.attachmentIds?.length && !l.images?.length,
  },
  {
    field: 'description',
    severity: 'warning',
    messageEn: 'No description — buyers need product details',
    messageAr: 'لا يوجد وصف — المشتري يحتاج تفاصيل المنتج',
    test: (l) => !l.description?.trim(),
  },
  {
    field: 'categoryId',
    severity: 'warning',
    messageEn: 'No category — product won\'t appear in filters',
    messageAr: 'بدون تصنيف — المنتج لن يظهر في الفلاتر',
    test: (l) => !l.categoryId,
  },
  {
    field: 'condition',
    severity: 'info',
    messageEn: 'Condition not set — specify new or used',
    messageAr: 'لم تحدد حالة المنتج — حدد جديد أو مستعمل',
    test: (l) => !l.condition,
  },
  {
    field: 'specs',
    severity: 'info',
    messageEn: 'No specifications — add details to build buyer trust',
    messageAr: 'لا توجد مواصفات — أضف تفاصيل لزيادة ثقة المشتري',
    test: (l) => !l.specs?.length,
  },
  {
    field: 'brand',
    severity: 'info',
    messageEn: 'No brand — helps with search and discovery',
    messageAr: 'لم تحدد العلامة التجارية — يساعد في البحث والاكتشاف',
    test: (l) => !l.brand,
  },
  {
    field: 'sources',
    severity: 'info',
    messageEn: 'No reference sources — add links for credibility',
    messageAr: 'لا توجد مصادر مرجعية — أضف روابط لزيادة الموثوقية',
    test: (l) => !l.sources?.length,
  },
];

export function analyzeProductReadiness(listing: ProductListing): Shortcoming[] {
  return CHECKS.filter((check) => check.test(listing)).map(
    ({ field, severity, messageEn, messageAr }) => ({
      field,
      severity,
      messageEn,
      messageAr,
    }),
  );
}

export function getReadinessScore(listing: ProductListing): { score: number; total: number } {
  const shortcomings = analyzeProductReadiness(listing);
  return {
    score: CHECKS.length - shortcomings.length,
    total: CHECKS.length,
  };
}
