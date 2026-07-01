import React, { useMemo } from 'react';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { cn } from '@core/lib/utils/cn';
import { AmberInput } from '@core/components/AmberInput';
import type { CategoryFormData } from '../lib';
import { getCategoryNameWarnings, CATEGORY_CHIP_RECOMMENDED_MAX, CATEGORY_MAX_WORDS_RECOMMENDED } from '../lib';

interface CategoryNameFieldsProps {
  language: string;
  dir: 'rtl' | 'ltr';
  t: (key: string, variables?: Record<string, string | number>) => string;
  register: UseFormRegister<CategoryFormData>;
  formErrors: FieldErrors<CategoryFormData>;
  showSecondaryLang: boolean;
  setShowSecondaryLang: React.Dispatch<React.SetStateAction<boolean>>;
  nameValue?: string;
  nameArValue?: string;
}

export function CategoryNameFields({
  language,
  dir,
  t,
  register,
  formErrors,
  showSecondaryLang,
  setShowSecondaryLang,
  nameValue = '',
  nameArValue = '',
}: CategoryNameFieldsProps) {
  const isArabicPrimary = language === 'ar';

  const nameWarnings = useMemo(
    () => getCategoryNameWarnings({ name: nameValue, nameAr: nameArValue }),
    [nameValue, nameArValue],
  );

  const warningsForField = (field: 'name' | 'nameAr') =>
    nameWarnings.filter((w) => w.field === field);

  const renderFieldWarnings = (field: 'name' | 'nameAr') => {
    const items = warningsForField(field);
    if (items.length === 0) return null;
    return (
      <div className="space-y-1.5 -mt-1">
        {items.map((w) => (
          <div
            key={w.code}
            className="flex items-start gap-2 text-[12px] text-amber-400/90"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {t(w.messageKey, {
                max:
                  w.code.includes('too_many_words')
                    ? CATEGORY_MAX_WORDS_RECOMMENDED
                    : CATEGORY_CHIP_RECOMMENDED_MAX,
              })}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const primaryLabel = isArabicPrimary
    ? t('category.name_ar') || 'Arabic name'
    : t('category.name_en') || 'Name (English)';

  const primaryPlaceholder = isArabicPrimary
    ? t('category.name_ar') || 'الاسم بالعربية'
    : t('category.name_en') || 'Name (English)';

  const secondaryToggleLabel = isArabicPrimary
    ? t('category.add_english_name') || 'Add English name'
    : t('category.add_arabic_name') || 'Add Arabic name';

  const secondaryLabel = isArabicPrimary
    ? t('category.name_en') || 'Name (English)'
    : t('category.name_ar') || 'Arabic name';

  const secondaryPlaceholder = isArabicPrimary
    ? t('category.name_en') || 'Name (English)'
    : t('category.name_ar') || 'الاسم بالعربية';

  const primaryField = isArabicPrimary ? 'nameAr' : 'name';
  const secondaryField = isArabicPrimary ? 'name' : 'nameAr';

  const primaryError = formErrors[primaryField]?.message
    ? t(String(formErrors[primaryField]?.message))
    : undefined;

  const secondaryError = formErrors[secondaryField]?.message
    ? t(String(formErrors[secondaryField]?.message))
    : undefined;

  const hintKey = isArabicPrimary
    ? 'category.auto_translate_hint_from_ar'
    : 'category.auto_translate_hint';

  return (
    <div className="space-y-4">
      <AmberInput
        label={primaryLabel}
        placeholder={primaryPlaceholder}
        error={primaryError}
        required
        {...register(primaryField)}
      />
      {renderFieldWarnings(primaryField)}

      <p className="text-[13px] text-zinc-muted -mt-2">
        {t('category.validation.short_title_hint')}
      </p>

      <p className="text-[13px] text-zinc-muted">
        {t(hintKey) ||
          (isArabicPrimary
            ? 'Name is auto-translated to English. Add English name below to customize.'
            : 'Name is auto-translated to Arabic (and Kurdish). Add Arabic name below to customize.')}
      </p>

      <button
        type="button"
        dir={dir}
        onClick={() => setShowSecondaryLang((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-colors"
      >
        <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
          {secondaryToggleLabel}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 shrink-0 text-zinc-muted transition-transform',
            showSecondaryLang && 'rotate-180',
          )}
        />
      </button>

      {showSecondaryLang && (
        <>
          <AmberInput
            label={secondaryLabel}
            placeholder={secondaryPlaceholder}
            error={secondaryError}
            {...register(secondaryField)}
          />
          {renderFieldWarnings(secondaryField)}
        </>
      )}
    </div>
  );
}
