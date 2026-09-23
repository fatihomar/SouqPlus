import { z } from 'zod';

export const createOfferSchema = z.object({
  body: z.object({
    amount: z.coerce.number({ required_error: 'ERR_AMOUNT_REQUIRED', invalid_type_error: 'ERR_AMOUNT_INVALID_TYPE' })
      .positive('ERR_AMOUNT_MUST_BE_POSITIVE')
      .max(1000000000, 'ERR_AMOUNT_TOO_LARGE')
      .refine((val) => !isNaN(val) && isFinite(val), { message: 'ERR_AMOUNT_INVALID' }),
    listingId: z.string({ required_error: 'ERR_LISTING_ID_REQUIRED' }).uuid('ERR_INVALID_UUID'),
  }).strict('ERR_UNKNOWN_FIELDS_NOT_ALLOWED'),
});

export const respondToOfferSchema = z.object({
  body: z.object({
    action: z.enum(['ACCEPT', 'REJECT', 'COUNTER'], { required_error: 'ERR_ACTION_REQUIRED', invalid_type_error: 'ERR_ACTION_INVALID' }),
  }).strict('ERR_UNKNOWN_FIELDS_NOT_ALLOWED'),
});

