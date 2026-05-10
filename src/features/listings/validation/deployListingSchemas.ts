import { z } from 'zod';

const startDateTime = z
  .string()
  .min(1, 'Start time is required')
  .refine((s) => !Number.isNaN(new Date(s).getTime()), 'Invalid start time');

const endDateTime = z
  .string()
  .min(1, 'End time is required')
  .refine((s) => !Number.isNaN(new Date(s).getTime()), 'Invalid end time');

/** Raw deploy-as-auction form (matches DeployListingPage state). */
export const deployAuctionFormSchema = z
  .object({
    startPrice: z.coerce.number().refine((n) => Number.isFinite(n) && n >= 1, {
      message: 'Start price must be at least 1',
    }),
    bidIncrement: z.coerce.number().refine((n) => Number.isFinite(n) && n >= 1, {
      message: 'Bid increment must be at least 1',
    }),
    buyNowPrice: z.union([z.string(), z.number()]).optional(),
    reservePrice: z.union([z.string(), z.number()]).optional(),
    startTime: startDateTime,
    endTime: endDateTime,
  })
  .superRefine((data, ctx) => {
    const buyRaw = data.buyNowPrice;
    let buyNum: number | undefined;
    if (buyRaw !== '' && buyRaw !== undefined && buyRaw !== null) {
      buyNum = typeof buyRaw === 'number' ? buyRaw : Number(String(buyRaw).trim());
      if (!Number.isFinite(buyNum) || buyNum < 1) {
        ctx.addIssue({ code: 'custom', path: ['buyNowPrice'], message: 'Buy now must be at least 1 when set' });
        buyNum = undefined;
      }
    }
    const resRaw = data.reservePrice;
    let resNum: number | undefined;
    if (resRaw !== '' && resRaw !== undefined && resRaw !== null) {
      resNum = typeof resRaw === 'number' ? resRaw : Number(String(resRaw).trim());
      if (!Number.isFinite(resNum) || resNum < 1) {
        ctx.addIssue({ code: 'custom', path: ['reservePrice'], message: 'Reserve must be at least 1 when set' });
        resNum = undefined;
      }
    }
    const t0 = new Date(data.startTime).getTime();
    const t1 = new Date(data.endTime).getTime();
    if (Number.isNaN(t1)) {
      ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'Invalid end time' });
      return;
    }
    if (t1 <= t0) {
      ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'End time must be after start time' });
    }
    if (buyNum !== undefined && buyNum < data.startPrice) {
      ctx.addIssue({
        code: 'custom',
        path: ['buyNowPrice'],
        message: 'Buy now must be greater than or equal to start price',
      });
    }
  });

export const deployGroupBuyFormSchema = z
  .object({
    originalPrice: z.coerce.number().refine((n) => Number.isFinite(n) && n >= 1, {
      message: 'Original price must be at least 1',
    }),
    dealPrice: z.coerce.number().refine((n) => Number.isFinite(n) && n >= 1, {
      message: 'Deal price must be at least 1',
    }),
    minParticipants: z.coerce
      .number()
      .int()
      .min(2, { message: 'Minimum participants must be at least 2' }),
    maxParticipants: z.coerce.number().int().min(1, { message: 'Max participants must be at least 1' }),
    startTime: startDateTime,
    endTime: endDateTime,
    autoCreateOrder: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.maxParticipants < data.minParticipants) {
      ctx.addIssue({
        code: 'custom',
        path: ['maxParticipants'],
        message: 'Max participants must be greater than or equal to min',
      });
    }
    if (data.dealPrice >= data.originalPrice) {
      ctx.addIssue({
        code: 'custom',
        path: ['dealPrice'],
        message: 'Deal price must be less than original price',
      });
    }
    const t0 = new Date(data.startTime).getTime();
    const t1 = new Date(data.endTime).getTime();
    if (Number.isNaN(t1)) {
      ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'Invalid end time' });
      return;
    }
    if (t1 <= t0) {
      ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'End time must be after start time' });
    }
  });
