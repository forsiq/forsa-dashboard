/** Normalize text for category search (Arabic hamza/alef variants, diacritics). */
export function normalizeCategorySearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .trim();
}

export function categorySearchMatches(
  haystack: string | undefined | null,
  needle: string,
): boolean {
  if (!needle) return true;
  if (!haystack?.trim()) return false;
  return normalizeCategorySearchText(haystack).includes(
    normalizeCategorySearchText(needle),
  );
}
