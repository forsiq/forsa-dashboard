import { z } from 'zod';

type TFn = (key: string, variables?: Record<string, string | number>) => string;

function msg(t: TFn, key: string, fallback: string) {
  const v = t(key);
  return v && v !== key ? v : fallback;
}

/** Deploy listing → auction (client-side, localized). */
export function createDeployAuctionClientSchema(
  t: TFn,
  options: { requireSchedule: boolean },
) {
  return z
    .object({
      startPrice: z.coerce.number().refine((n) => Number.isFinite(n) && n >= 1, {
        message: msg(t, 'listing.deploy.validation.start_price_min', 'Start price must be at least 1'),
      }),
      bidIncrement: z.coerce.number().refine((n) => Number.isFinite(n) && n >= 1, {
        message: msg(t, 'listing.deploy.validation.bid_increment_min', 'Bid increment must be at least 1'),
      }),
      originalPrice: z.union([z.string(), z.number()]).optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      durationDays: z.coerce.number().optional(),
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

      if (options.requireSchedule) {
        if (!data.startTime?.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['startTime'],
            message: msg(t, 'listing.deploy.validation.start_time_required', 'Start time is required'),
          });
        } else if (Number.isNaN(new Date(data.startTime).getTime())) {
          ctx.addIssue({
            code: 'custom',
            path: ['startTime'],
            message: msg(t, 'listing.deploy.validation.start_time_invalid', 'Invalid start time'),
          });
        }
        if (!data.endTime?.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['endTime'],
            message: msg(t, 'listing.deploy.validation.end_time_required', 'End time is required'),
          });
        } else if (Number.isNaN(new Date(data.endTime).getTime())) {
          ctx.addIssue({
            code: 'custom',
            path: ['endTime'],
            message: msg(t, 'listing.deploy.validation.end_time_invalid', 'Invalid end time'),
          });
        } else if (data.startTime && !Number.isNaN(new Date(data.startTime).getTime())) {
          const t0 = new Date(data.startTime).getTime();
          const t1 = new Date(data.endTime).getTime();
          if (t1 <= t0) {
            ctx.addIssue({
              code: 'custom',
              path: ['endTime'],
              message: msg(
                t,
                'listing.deploy.validation.end_after_start',
                'End time must be after start time',
              ),
            });
          }
        }
      }
    });
}

/** Deploy listing → group buy (client-side, localized). */
export function createDeployGroupBuyClientSchema(
  t: TFn,
  options: { requireSchedule: boolean },
) {
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
      startTime: z.string().optional(),
      endTime: z.string().optional(),
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

      if (options.requireSchedule) {
        if (!data.startTime?.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['startTime'],
            message: msg(t, 'listing.deploy.validation.start_time_required', 'Start time is required'),
          });
        } else if (Number.isNaN(new Date(data.startTime).getTime())) {
          ctx.addIssue({
            code: 'custom',
            path: ['startTime'],
            message: msg(t, 'listing.deploy.validation.start_time_invalid', 'Invalid start time'),
          });
        }
        if (!data.endTime?.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['endTime'],
            message: msg(t, 'listing.deploy.validation.end_time_required', 'End time is required'),
          });
        } else if (Number.isNaN(new Date(data.endTime).getTime())) {
          ctx.addIssue({
            code: 'custom',
            path: ['endTime'],
            message: msg(t, 'listing.deploy.validation.end_time_invalid', 'Invalid end time'),
          });
        } else if (data.startTime && !Number.isNaN(new Date(data.startTime).getTime())) {
          const t0 = new Date(data.startTime).getTime();
          const t1 = new Date(data.endTime).getTime();
          if (t1 <= t0) {
            ctx.addIssue({
              code: 'custom',
              path: ['endTime'],
              message: msg(
                t,
                'listing.deploy.validation.end_after_start',
                'End time must be after start time',
              ),
            });
          }
        }
      }
    });
}
