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
