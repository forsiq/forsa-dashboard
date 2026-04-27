export type SearchOperator = 'equals';

export interface SearchPropertyDefinition {
  key: string;
  aliases?: string[];
  label: string;
  displayKey?: string;
  operator?: SearchOperator;
  values?: string[];
}

export interface SearchParseResult {
  text: string;
  fields: Record<string, string>;
}

const TERM_SPLIT_REGEX = /\s+/;

function normalizeKey(key: string): string {
  return key.trim().toLowerCase();
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseUnifiedSearch(query: string, definitions: SearchPropertyDefinition[]): SearchParseResult {
  const fieldMap = new Map<string, string>();
  const keyToCanonical = new Map<string, string>();

  definitions.forEach((def) => {
    const canonical = normalizeKey(def.key);
    keyToCanonical.set(canonical, canonical);
    (def.aliases || []).forEach((alias) => keyToCanonical.set(normalizeKey(alias), canonical));
  });

  const textTerms: string[] = [];
  const terms = query
    .split(TERM_SPLIT_REGEX)
    .map((term) => term.trim())
    .filter(Boolean);

  terms.forEach((term) => {
    const colonIndex = term.indexOf(':');
    if (colonIndex <= 0) {
      textTerms.push(term);
      return;
    }

    const rawKey = normalizeKey(term.slice(0, colonIndex));
    const rawValue = stripQuotes(term.slice(colonIndex + 1));
    const canonicalKey = keyToCanonical.get(rawKey);

    if (!canonicalKey || !rawValue) {
      textTerms.push(term);
      return;
    }

    fieldMap.set(canonicalKey, rawValue);
  });

  return {
    text: textTerms.join(' ').trim(),
    fields: Object.fromEntries(fieldMap.entries()),
  };
}
