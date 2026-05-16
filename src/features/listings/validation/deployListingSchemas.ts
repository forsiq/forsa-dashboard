import { z } from 'zod';

type TFn = (key: string, variables?: Record<string, string | number>) => string;

function msg(t: TFn, key: string, fallback: string) {
  const v = t(key);
  return v && v !== key ? v : fallback;
}

/** Deploy listing → auction (pricing only; window is set server-side). */
export function createDeployAuctionClientSchema(t: TFn) {
  return z
    .object({
      startPrice: z.coerce.number().refine((n) => Number.isFinite(n) && n >= 1, {
        message: msg(t, 'listing.deploy.validation.start_price_min', 'Start price must be at least 1'),
      }),
      bidIncrement: z.coerce.number().refine((n) => Number.isFinite(n) && n >= 1, {
        message: msg(t, 'listing.deploy.validation.bid_increment_min', 'Bid increment must be at least 1'),
      }),
      originalPrice: z.union([z.string(), z.number()]).optional(),
    })
    .superRefine((data, ctx) => {
      const origRaw = data.originalPrice;
      if (origRaw !== '' && origRaw !== undefined && origRaw !== null) {
        const origNum = typeof origRaw === 'number' ? origRaw : Number(String(origRaw).trim());
        if (!Number.isFinite(origNum) || origNum < 1) {
          ctx.addIssue({
            code: 'custom',
            path: ['originalPrice'],
            message: msg(
              t,
              'listing.deploy.validation.original_price_min',
              'Original price must be at least 1 when set',
            ),
          });
        } else if (origNum <= data.startPrice) {
          ctx.addIssue({
            code: 'custom',
            path: ['originalPrice'],
            message: msg(
              t,
              'listing.deploy.validation.original_price_gt_start',
              'Original price must be greater than start price',
            ),
          });
        }
      }
    });
}

/** Deploy listing → group buy (pricing only; window is set server-side). */
export function createDeployGroupBuyClientSchema(t: TFn) {
  return z
    .object({
      originalPrice: z.coerce.number().refine((n) => Number.isFinite(n) && n >= 1, {
        message: msg(t, 'listing.deploy.validation.original_price_min', 'Original price must be at least 1'),
      }),
      dealPrice: z.coerce.number().refine((n) => Number.isFinite(n) && n >= 1, {
        message: msg(t, 'listing.deploy.validation.deal_price_min', 'Deal price must be at least 1'),
      }),
      minParticipants: z.coerce
        .number()
        .int()
        .min(2, {
          message: msg(
            t,
            'listing.deploy.validation.min_participants_min',
            'Minimum participants must be at least 2',
          ),
        }),
      maxParticipants: z.coerce.number().int().min(1, {
        message: msg(
          t,
          'listing.deploy.validation.max_participants_min',
          'Max participants must be at least 1',
        ),
      }),
      autoCreateOrder: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.maxParticipants < data.minParticipants) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxParticipants'],
          message: msg(
            t,
            'listing.deploy.validation.max_gte_min_participants',
            'Max participants must be greater than or equal to min',
          ),
        });
      }
      if (data.dealPrice >= data.originalPrice) {
        ctx.addIssue({
          code: 'custom',
          path: ['dealPrice'],
          message: msg(
            t,
            'listing.deploy.validation.deal_price_lt_original',
            'Deal price must be less than original price',
          ),
        });
      }
    });
}
