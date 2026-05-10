import { z } from 'zod';

type TFn = (key: string) => string;

function msg(t: TFn, key: string, fallback: string) {
  const v = t(key);
  return v && v !== key ? v : fallback;
}

/**
 * Client-side checks before create/update auction API.
 * Aligns with common backend rules (@Min(1) style for money and increments).
 */
export function createAuctionFormPageSchema(t: TFn) {
  return z
    .object({
      title: z.string().trim().min(1, msg(t, 'auction.validation.title_required', 'Title is required')),
      startPrice: z.number().refine((n) => Number.isFinite(n) && n >= 1, {
        message: msg(t, 'auction.validation.start_price_gt_0', 'Start price must be at least 1'),
      }),
      bidIncrement: z.number().refine((n) => Number.isFinite(n) && n >= 1, {
        message: msg(t, 'auction.validation.bid_increment_min', 'Bid increment must be at least 1'),
      }),
      categoryId: z.number().int().positive({
        message: msg(t, 'auction.validation.category_required', 'Category is required'),
      }),
      startTime: z.string().min(1, msg(t, 'auction.validation.start_time_required', 'Start time is required')),
      endTime: z.string().min(1, msg(t, 'auction.validation.end_time_required', 'End time is required')),
      buyNowPrice: z.number().optional(),
      reservePrice: z.number().optional(),
    })
    .superRefine((data, ctx) => {
      const ts = new Date(data.startTime).getTime();
      const te = new Date(data.endTime).getTime();
      if (Number.isNaN(ts)) {
        ctx.addIssue({
          code: 'custom',
          path: ['startTime'],
          message: msg(t, 'auction.validation.start_time_invalid', 'Invalid start time'),
        });
      }
      if (Number.isNaN(te)) {
        ctx.addIssue({
          code: 'custom',
          path: ['endTime'],
          message: msg(t, 'auction.validation.end_time_invalid', 'Invalid end time'),
        });
        return;
      }
      if (!Number.isNaN(ts) && !Number.isNaN(te) && te <= ts) {
        ctx.addIssue({
          code: 'custom',
          path: ['endTime'],
          message: msg(t, 'auction.validation.end_after_start', 'End time must be after start time'),
        });
      }
      const buy = data.buyNowPrice;
      if (buy !== undefined && buy !== null && Number.isFinite(buy) && buy > 0 && buy < data.startPrice) {
        ctx.addIssue({
          code: 'custom',
          path: ['buyNowPrice'],
          message: msg(
            t,
            'auction.validation.buy_now_gte_start',
            'Buy now must be greater than or equal to start price'
          ),
        });
      }
    });
}
