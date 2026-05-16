/**
 * Normalize NestJS / class-validator API errors into user-facing strings.
 * Handles message as string | string[], and glued messages like "...than 1buyNowPrice...".
 */

export type TranslateFn = (key: string, variables?: Record<string, string | number>) => string;

type ApiLike = {
  message?: unknown;
  details?: unknown;
};

/** After a digit, next token starts a camelCase property name (unglue concatenated validator lines). */
const GLUED_MESSAGE_SPLIT = /(?<=[\d.])(?=[a-z][a-zA-Z]*(?:Price|Increment|Time|Id|Amount)\b)/i;

function splitGluedValidationString(s: string): string[] {
  const trimmed = s.trim();
  if (!trimmed) return [];
  const parts = trimmed.split(GLUED_MESSAGE_SPLIT).map((p) => p.trim()).filter(Boolean);
  return parts.length ? parts : [trimmed];
}

function messagesFromDetails(details: unknown): string[] {
  if (!Array.isArray(details)) return [];
  const out: string[] = [];
  for (const item of details) {
    if (typeof item === 'string') out.push(...splitGluedValidationString(item));
    else if (item && typeof item === 'object' && typeof (item as { message?: unknown }).message === 'string') {
      out.push(...splitGluedValidationString((item as { message: string }).message));
    }
  }
  return out.map((s) => s.trim()).filter(Boolean);
}

/**
 * Extract raw English validation lines from an API error object (axios interceptor shape or raw axios error).
 */
export function extractApiErrorMessages(error: unknown): string[] {
  if (!error || typeof error !== 'object') return [];

  const e = error as ApiLike & { response?: { data?: ApiLike } };
  const data = e.response?.data;

  const fromDetails = [
    ...messagesFromDetails(e.details),
    ...messagesFromDetails(data?.details),
  ];
  if (fromDetails.length) return fromDetails;

  const tryMessage = (msg: unknown): string[] => {
    if (Array.isArray(msg)) {
      return msg
        .filter((x): x is string => typeof x === 'string')
        .flatMap((x) => splitGluedValidationString(x));
    }
    if (typeof msg === 'string') return splitGluedValidationString(msg);
    return [];
  };

  const fromBody = data ? tryMessage(data.message) : [];
  if (fromBody.length) return fromBody;
  const fromTop = tryMessage(e.message);
  if (fromTop.length) return fromTop;
  return [];
}

const MUST_NOT_BE_LESS = /^([a-zA-Z][a-zA-Z0-9_]*) must not be less than ([\d.,]+)\s*$/;

/** Known form field names for inline error display. */
const API_FIELD_NAMES = [
  'startPrice',
  'originalPrice',
  'reservePrice',
  'bidIncrement',
  'buyNowPrice',
  'dealPrice',
  'minParticipants',
  'maxParticipants',
  'startTime',
  'endTime',
] as const;

function fieldKeyFromRawMessage(raw: string): string | null {
  const m = raw.trim();
  if (!m) return null;
  for (const field of API_FIELD_NAMES) {
    if (new RegExp(`^${field}\\b`, 'i').test(m)) return field;
  }
  const generic = m.match(MUST_NOT_BE_LESS);
  if (generic?.[1] && API_FIELD_NAMES.includes(generic[1] as (typeof API_FIELD_NAMES)[number])) {
    return generic[1];
  }
  if (/^Reserve price must be >= start price$/i.test(m)) return 'reservePrice';
  if (/^Buy now price must be > start price$/i.test(m)) return 'buyNowPrice';
  if (/^Original price must be > start price$/i.test(m)) return 'originalPrice';
  if (/^Deal price must be less than original price$/i.test(m)) return 'dealPrice';
  if (/^startTime must be a valid ISO 8601 date string$/i.test(m)) return 'startTime';
  if (/^endTime must be a valid ISO 8601 date string$/i.test(m)) return 'endTime';
  return null;
}

function mapOneRawMessage(raw: string, t: TranslateFn, language: string): string {
  const m = raw.trim();
  if (!m) return '';

  const start = /^startPrice must not be less than ([\d.,]+)\s*$/i.exec(m);
  if (start) return t('validation.start_price_min', { min: start[1] });

  const buyNow = /^buyNowPrice must not be less than ([\d.,]+)\s*$/i.exec(m);
  if (buyNow) return t('validation.buy_now_price_min', { min: buyNow[1] });

  const reserve = /^reservePrice must not be less than ([\d.,]+)\s*$/i.exec(m);
  if (reserve) return t('validation.reserve_price_min', { min: reserve[1] });

  const original = /^originalPrice must not be less than ([\d.,]+)\s*$/i.exec(m);
  if (original) return t('validation.original_price_min', { min: original[1] });

  const increment = /^bidIncrement must not be less than ([\d.,]+)\s*$/i.exec(m);
  if (increment) return t('validation.bid_increment_min', { min: increment[1] });

  if (/^Reserve price must be >= start price$/i.test(m)) {
    return t('auction.validation.reserve_gte_start');
  }
  if (/^Buy now price must be > start price$/i.test(m)) {
    return t('auction.validation.buy_now_gt_start');
  }
  if (/^Original price must be > start price$/i.test(m)) {
    return t('auction.validation.original_gt_start');
  }
  if (/^Deal price must be less than original price$/i.test(m)) {
    return t('listing.deploy.validation.deal_price_lt_original');
  }
  if (/^Max participants must be greater than or equal to min$/i.test(m)) {
    return t('listing.deploy.validation.max_gte_min_participants');
  }
  if (/^startTime must be a valid ISO 8601 date string$/i.test(m) || /^startTime must be a valid date$/i.test(m)) {
    return t('listing.deploy.validation.start_time_invalid');
  }
  if (/^endTime must be a valid ISO 8601 date string$/i.test(m) || /^endTime must be a valid date$/i.test(m)) {
    return t('listing.deploy.validation.end_time_invalid');
  }

  const generic = m.match(MUST_NOT_BE_LESS);
  if (generic) {
    return t('validation.field_must_be_at_least', { field: generic[1], min: generic[2] });
  }

  return language === 'en' ? m : t('validation.api_unmapped_fallback', { message: m });
}

export type FormatApiValidationOptions = {
  /** Join multiple lines for inline / toast display */
  joinWith?: string;
  /** If true, only the first mapped line is returned */
  firstOnly?: boolean;
};

/**
 * Map known class-validator messages through `t()`; unknown lines stay English for `en`,
 * otherwise a short Arabic wrapper plus the original server text.
 */
export function mapApiValidationToUserMessage(
  error: unknown,
  t: TranslateFn,
  language: string,
  options?: FormatApiValidationOptions,
): string {
  const lines = extractApiErrorMessages(error);
  const joinWith = options?.joinWith ?? ' · ';
  if (!lines.length) {
    const e = error as ApiLike & { response?: { data?: ApiLike } };
    const dataMsg = e.response?.data?.message;
    if (typeof dataMsg === 'string' && dataMsg.trim()) return dataMsg.trim();
    if (Array.isArray(dataMsg)) {
      const joined = dataMsg.filter((x): x is string => typeof x === 'string').join(joinWith);
      if (joined.trim()) return joined.trim();
    }
    const fallback =
      error && typeof error === 'object' && typeof (error as ApiLike).message === 'string'
        ? (error as ApiLike).message
        : '';
    return typeof fallback === 'string' ? fallback.trim() : '';
  }
  const mapped = lines.map((line) => mapOneRawMessage(line, t, language)).filter(Boolean);
  const body = options?.firstOnly ? mapped[0] : mapped.join(joinWith);
  return body || '';
}

/**
 * Map API validation lines to per-field messages (first error per field wins).
 * Use when the form can show inline errors instead of only a toast/banner.
 */
export function mapApiValidationToFieldMap(
  error: unknown,
  t: TranslateFn,
  language: string,
): Record<string, string> {
  const lines = extractApiErrorMessages(error);
  const out: Record<string, string> = {};
  for (const line of lines) {
    const field = fieldKeyFromRawMessage(line);
    const message = mapOneRawMessage(line, t, language);
    if (!message) continue;
    if (field && !out[field]) out[field] = message;
    else if (!out._form) out._form = message;
  }
  if (!Object.keys(out).length) {
    const summary = mapApiValidationToUserMessage(error, t, language, { firstOnly: true });
    if (summary) out._form = summary;
  }
  return out;
}
